import { ZodType, z } from "zod";
import { KeyType, PublicKey, Signer, ed25519PublicKey, secp256k1PublicKey } from "../index.ts";
import { fireblocksAPI, importKey } from "./fireblocks/fetch.ts";
import { Account, Address, PublicKeyInfo, Transaction } from "./fireblocks/types.ts";
import { SignerProvider } from "./provider.js";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";
import { compressSecp256k1PublicKey } from "../../utils/secp256k1.ts";


export type FireblocksKeyAlgorithm = "MPC_EDDSA_ED25519" | "MPC_ECDSA_SECP256K1";

export const keyTypeToFireblocksAlgorithm = {
    "ed25519": "MPC_EDDSA_ED25519",
    "secp256k1": "MPC_ECDSA_SECP256K1",
} as const;

export const fireblocksAlgorithmToKeyType = {
    "MPC_EDDSA_ED25519": "ed25519",
    "MPC_ECDSA_SECP256K1": "secp256k1",
} as const;

export interface FireblocksSignerOptions {
    assetId: string;
    // XXX: no idea what this is for honestly
    change?: number;
    expectedAlgorithm: FireblocksKeyAlgorithm;
}

export class FireblocksSignerProvider<
    S extends Signer<K>,
    K extends typeof fireblocksAlgorithmToKeyType[P["expectedAlgorithm"]],
    P extends FireblocksSignerOptions = FireblocksSignerOptions
> implements SignerProvider<
    S,
    K,
    P
> {
    __apiKey: string;
    __apiSecret: string;
    __apiBaseUrl: string;

    constructor(apiKey: string, apiSecret: string, apiBaseUrl: string = "https://api.fireblocks.io") {
        this.__apiKey = apiKey;
        this.__apiSecret = apiSecret;
        this.__apiBaseUrl = apiBaseUrl;
    }

    async getSigner<S2 extends S = S>(vaultAccountId: string, options: FireblocksSignerOptions): Promise<S2> {
        const keyType = fireblocksAlgorithmToKeyType[options.expectedAlgorithm];
        const secretKey = await importKey(this.__apiSecret);
        const signer = new FireblocksSigner(
            keyType,
            vaultAccountId,
            this.__apiKey,
            secretKey,
            this.__apiBaseUrl,
            options,
        );
        await signer.init();

        // TODO
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return signer;
    }
}

class FireblocksSigner<K extends KeyType> implements Signer<K> {
    __vaultAccountId: string;
    __apiKey: string;
    __secretKey: CryptoKey;
    __apiBaseUrl: string;
    __assetId: string;
    __expectedAlgorithm: FireblocksKeyAlgorithm;

    ___publicKey: PublicKey<K> | undefined;
    keyType: K;

    static txFailStatuses = new Set<Transaction["status"]>([
        "BLOCKED",
        "CANCELLED",
        "FAILED",
    ]);

    constructor(
        keyType: K,
        vaultAccountId: string,
        apiKey: string,
        secretKey: CryptoKey,
        apiBaseUrl: string,

        options: FireblocksSignerOptions,
    ) {
        this.keyType = keyType;
        this.__vaultAccountId = vaultAccountId;
        this.__apiKey = apiKey;
        this.__secretKey = secretKey;
        this.__apiBaseUrl = apiBaseUrl;

        this.__assetId = options.assetId;
        this.__expectedAlgorithm = options.expectedAlgorithm;
    }

    signSync(_payload: Uint8Array): Uint8Array {
        throw new Error("signSync is not available on FireblocksSigner");
    }

    async init(): Promise<void> {
        // Ensure that account exists
        let account: Account;
        try {
            account = await this.fireblocksGet(
                Account,
                `/v1/vault/accounts/${this.__vaultAccountId}`,
            );

            account.id;
        } catch (err) {
            throw new Error(`Vault account "${this.__vaultAccountId}" does not exist`, { cause: err as Error });
        }

        // Ensure we have at least one address available for desired asset
        const addresses = await this.fireblocksGet(
            z.array(Address).nonempty(),
            `/v1/vault/accounts/${this.__vaultAccountId}/${this.__assetId}/addresses?compressed=true`,
        );
        if (addresses.length < 1) {
            throw new Error(`No addresses available for asset "${this.__assetId}"`);
        }

        // Query public key
        const change = 0;
        const addressIdx = 0;
        const publicKeyInfo = await this.fireblocksGet(
            PublicKeyInfo,
            `/v1/vault/accounts/${this.__vaultAccountId}/${this.__assetId}/${change}/${addressIdx}/public_key_info`,
        );

        // Ensure that public key is using expected algorithm
        if (publicKeyInfo.algorithm !== this.__expectedAlgorithm) {
            throw new Error(`Expected "${this.__expectedAlgorithm}", got "${publicKeyInfo.algorithm}"`);
        }

        // TODO: this is ugly
        if (this.keyType === "ed25519") {
            const publicKeyBytes = hexToBytes(publicKeyInfo.publicKey);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.___publicKey = new ed25519PublicKey(publicKeyBytes) as PublicKey<K>;
        } else if (this.keyType === "secp256k1") {
            const compressedPublicKey = compressSecp256k1PublicKey(publicKeyInfo.publicKey);
            const publicKeyBytes = hexToBytes(compressedPublicKey);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.___publicKey = new secp256k1PublicKey(publicKeyBytes) as PublicKey<K>;
        } else {
            throw new Error(`Unsupported key type "${this.keyType}"`);
        }


        return;
    }

    get publicKey(): PublicKey<K> {
        const p = this.___publicKey;
        if (!p) {
            throw new Error("Illegal state");
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return p;
    }

    private async _sign(payload: Uint8Array): Promise<Transaction["signedMessages"][number]["signature"]> {
        const content = bytesToHex(payload);
        const { id } = await this.fireblocksPost(z.object({ id: z.string() }), "/v1/transactions", {
            assetId: this.__assetId,
            source: {
                type: "VAULT_ACCOUNT",
                id: this.__vaultAccountId,
            },
            operation: "RAW",
            // Old - note: "Restake stake.js",
            extraParameters: {
                rawMessageData: {
                    messages: [
                        {
                            content,
                        },
                    ],
                },
            },
        });

        // Wait until transaction status is completed
        await this.waitTransaction(id);

        // Fetch previously created transaction
        const transaction = await this.fireblocksGet(Transaction, `/v1/transactions/${id}`);
        if (transaction.signedMessages.length < 1) {
            throw new Error("No signature available");
        }

        const signature = transaction.signedMessages[0].signature;

        return signature;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        const signature = await this._sign(payload);

        return hexToBytes(signature.fullSig);
    }

    async edSign(payload: Uint8Array): Promise<{ r: bigint, s: bigint, recovery?: number }> {
        const signature = await this._sign(payload);
        if (signature.r === undefined || signature.s === undefined || signature.v === undefined) {
            throw new Error("No r or s or v");
        }

        return {
            r: BigInt(`0x${signature.r}`),
            s: BigInt(`0x${signature.s}`),
            recovery: signature.v,
        };
    }

    verify(_payload: Uint8Array, _signature: Uint8Array): Promise<boolean> {
        throw new Error("verify not implemented");
    }

    private async fireblocksGet<T extends ZodType, R extends z.infer<T>>(
        validator: T,
        endpoint: string,
    ): Promise<R> {
        return fireblocksAPI(validator, this.__apiKey, this.__secretKey, this.__apiBaseUrl, "GET", endpoint);
    }

    private async fireblocksPost<T extends ZodType, R extends z.infer<T>>(
        validator: T,
        endpoint: string,
        body: unknown,
    ): Promise<R> {
        return fireblocksAPI(validator, this.__apiKey, this.__secretKey, this.__apiBaseUrl, "POST", endpoint, body);
    }

    private async getTransaction(txId: string): Promise<Transaction> {
        return await this.fireblocksGet(Transaction, `/v1/transactions/${txId}`);
    }

    private async waitTransaction(txId: string): Promise<void> {
        // TODO: copied from fireblocks NEAR reference SDK, surely there's a better way for this...
        let tx: Transaction = await this.getTransaction(txId);

        while (tx.status !== "COMPLETED") {
            // Sleep a bit
            await new Promise<void>((res) => setTimeout(() => res(), 5000));

            // Retry
            tx = await this.getTransaction(txId);
            if (FireblocksSigner.txFailStatuses.has(tx.status)) {
                throw new Error(`Transaction ${txId} failed: "${tx.status}" (sub=${tx.subStatus})`);
            }
        }

        return;
    }
}
