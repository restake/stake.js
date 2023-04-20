import { ZodType, z } from "zod";
import { KeyType, PublicKey, Signer, ed25519PublicKey } from "../index.js";
import { fireblocksAPI, importKey } from "./fireblocks/fetch.js";
import { Account, Address, PublicKeyInfo, Transaction } from "./fireblocks/types.js";
import { SignerProvider } from "./provider.js";
import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";


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
    #apiKey: string;
    #apiSecret: string;
    #apiBaseUrl: string;

    constructor(apiKey: string, apiSecret: string, apiBaseUrl: string = "https://api.fireblocks.io") {
        this.#apiKey = apiKey;
        this.#apiSecret = apiSecret;
        this.#apiBaseUrl = apiBaseUrl;
    }

    // Adjust return type to typeof options["expectedAlgorithm"]
    async getSigner(vaultAccountId: string, options: P): Promise<S> {
        const keyType = fireblocksAlgorithmToKeyType[options.expectedAlgorithm];
        const secretKey = await importKey(this.#apiSecret);
        const signer = new FireblocksSigner(
            keyType,
            vaultAccountId,
            this.#apiKey,
            secretKey,
            this.#apiBaseUrl,
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
    #vaultAccountId: string;
    #apiKey: string;
    #secretKey: CryptoKey;
    #apiBaseUrl: string;
    #assetId: string;
    #expectedAlgorithm: FireblocksKeyAlgorithm;

    #_publicKey: PublicKey<K> | undefined;
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
        this.#vaultAccountId = vaultAccountId;
        this.#apiKey = apiKey;
        this.#secretKey = secretKey;
        this.#apiBaseUrl = apiBaseUrl;

        this.#assetId = options.assetId;
        this.#expectedAlgorithm = options.expectedAlgorithm;
    }

    async init(): Promise<void> {
        // Ensure that account exists
        let account: Account;
        try {
            account = await this.fireblocksGet(
                Account,
                `/v1/vault/accounts/${this.#vaultAccountId}`,
            );

            account.id;
        } catch (err) {
            throw new Error(`Vault account "${this.#vaultAccountId}" does not exist`, { cause: err as Error });
        }

        // Ensure we have at least one address available for desired asset
        // TODO: do we need `compressed=true` here?
        const addresses = await this.fireblocksGet(
            z.array(Address).nonempty(),
            `/v1/vault/accounts/${this.#vaultAccountId}/${this.#assetId}/addresses?compressed=true`,
        );
        if (addresses.length < 1) {
            throw new Error(`No addresses available for asset "${this.#assetId}"`);
        }

        // Query public key
        const change = 0;
        const addressIdx = 0;
        const publicKeyInfo = await this.fireblocksGet(
            PublicKeyInfo,
            `/v1/vault/accounts/${this.#vaultAccountId}/${this.#assetId}/${change}/${addressIdx}/public_key_info`,
        );

        // Ensure that public key is using expected algorithm
        if (publicKeyInfo.algorithm !== this.#expectedAlgorithm) {
            throw new Error(`Expected "${this.#expectedAlgorithm}", got "${publicKeyInfo.algorithm}"`);
        }

        const publicKeyBytes = hexToBytes(publicKeyInfo.publicKey);

        // TODO: unsafe cast
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.#_publicKey = new ed25519PublicKey(publicKeyBytes) as PublicKey<K>;

        return;
    }

    get publicKey(): PublicKey<K> {
        const p = this.#_publicKey;
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
            assetId: this.#assetId,
            source: {
                type: "VAULT_ACCOUNT",
                id: this.#vaultAccountId,
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
        if (!signature.r || !signature.s || !signature.v) {
            throw new Error("No r or s or v");
        }

        return {
            r: BigInt(signature.r),
            s: BigInt(signature.s),
            // TODO: v is Ethereum-specific.
            recovery: Number(signature.v),
        };
    }

    verify(_payload: Uint8Array, _signature: Uint8Array): Promise<boolean> {
        throw new Error("verify not implemented");
    }

    private async fireblocksGet<T extends ZodType, R extends z.infer<T>>(
        validator: T,
        endpoint: string,
    ): Promise<R> {
        return fireblocksAPI(validator, this.#apiKey, this.#secretKey, this.#apiBaseUrl, "GET", endpoint);
    }

    private async fireblocksPost<T extends ZodType, R extends z.infer<T>>(
        validator: T,
        endpoint: string,
        body: unknown,
    ): Promise<R> {
        return fireblocksAPI(validator, this.#apiKey, this.#secretKey, this.#apiBaseUrl, "POST", endpoint, body);
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
