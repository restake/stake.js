import { SignedTransaction, Transaction } from "./SuiTransaction.js";
import {
    ed25519PublicKey,
    ed25519Signer,
    KeyType,
    PublicKey,
    secp256k1Signer,
    Signer,
    TransactionSigner,
} from "../../signer/index.js";
import { SuiNetwork } from "./network.js";
import { encode as b64encode } from "../../utils/base64.js";

import {
    Connection,
    ExportedKeypair,
    JsonRpcProvider,
    Keypair as SuiKeypair,
    normalizeSuiAddress,
    PublicKey as SuiPublicKey,
    RawSigner,
    SIGNATURE_SCHEME_TO_FLAG,
    SignatureScheme,
    SUI_ADDRESS_LENGTH,
    toSerializedSignature,
} from "@mysten/sui.js";
import { bytesToHex } from "@noble/curves/abstract/utils";
import { blake2b } from "@noble/hashes/blake2b";

const signatureMappings: { [key: KeyType]: SignatureScheme } = {
    "ed25519": "ED25519",
    "secp256k1": "Secp256k1",
};

type WrappedSuiKeypair<T extends KeyType = KeyType> = SuiKeypair & {
    __wrapped: Signer<T>;
};

function isWrappedSuiKeypair(
    keypair: SuiKeypair,
): keypair is WrappedSuiKeypair {
    return "__wrapped" in keypair;
}

type WrappedSuiPublicKey<T extends KeyType = KeyType> = SuiPublicKey & {
    __wrapped: PublicKey<T>;
};

function isWrappedSuiPublicKey(
    publicKey: SuiPublicKey,
): publicKey is WrappedSuiPublicKey {
    return "__wrapped" in publicKey;
}

export class SuiSigner implements TransactionSigner<Transaction, SignedTransaction> {
    __parent: ed25519Signer | secp256k1Signer;
    __network: SuiNetwork;
    __rpcProvider: JsonRpcProvider;

    __wrappedParent: ReturnType<typeof wrapKeypair>;
    __wrappedSigner: SuiSDKSignerImpl;

    constructor(parent: ed25519Signer | secp256k1Signer, network: SuiNetwork) {
        this.__parent = parent;
        this.__network = network;
        this.__rpcProvider = new JsonRpcProvider(
            new Connection({
                fullnode: network.rpcUrl,
                websocket: network.wsUrl,
                faucet: network.faucetUrl,
            }),
        );

        if (!(parent.keyType in signatureMappings)) {
            throw new Error(`Unsupported key type "${parent.keyType}"`);
        }

        this.__wrappedParent = wrapKeypair(this.__parent);
        this.__wrappedSigner = new SuiSDKSignerImpl(
            this.__wrappedParent,
            this.__rpcProvider,
        );
    }

    get keyPair(): SuiKeypair {
        return this.__wrappedParent;
    }

    async signTransaction(
        transaction: Transaction,
    ): Promise<SignedTransaction> {
        const payload = await this.__wrappedSigner.signTransactionBlock({
            transactionBlock: transaction.payload,
        });

        return {
            transaction,
            payload,
        };
    }
}

class SuiSDKSignerImpl extends RawSigner {
    __keypair: SuiKeypair;

    constructor(keypair: SuiKeypair, provider: JsonRpcProvider) {
        super(keypair, provider);
        this.__keypair = keypair;
    }

    override async signData(data: Uint8Array): Promise<string> {
        if (!isWrappedSuiKeypair(this.__keypair)) {
            return super.signData(data);
        }

        const signer = this.__keypair.__wrapped;

        const digest = blake2b(data, { dkLen: 32 });

        const signatureScheme = this.__keypair.getKeyScheme();
        const signature = await signer.sign(digest);
        const pubKey = this.__keypair.getPublicKey();

        return toSerializedSignature({
            signatureScheme,
            signature,
            pubKey,
        });
    }
}

function wrapKeypair<T extends KeyType>(signer: Signer<T>): WrappedSuiKeypair {
    const wrappedPublicKey = wrapPublicKey(signer.publicKey);

    return Object.freeze({
        __wrapped: signer,

        getPublicKey(): SuiPublicKey {
            return wrappedPublicKey;
        },

        signData(data: Uint8Array): Uint8Array {
            return signer.signSync(data);
        },

        getKeyScheme(): SignatureScheme {
            if (signer.keyType in signatureMappings) {
                return signatureMappings[signer.keyType];
            }

            throw new Error(`Unsupported key type "${signer.keyType}"`);
        },

        export(): ExportedKeypair {
            throw new Error("exporting the keypair is not supported");
        },
    });
}

function wrapPublicKey<T extends KeyType>(
    publicKey: PublicKey<T>,
): SuiPublicKey & { __wrapped: PublicKey<T> } {
    return Object.freeze({
        __wrapped: publicKey,

        equals(other: SuiPublicKey): boolean {
            if (isWrappedSuiPublicKey(other)) {
                // XXX: other.wrapped might not be PublicKey<T>, but we'll verify that
                const otherWrapped = other.__wrapped as PublicKey<T>;

                return otherWrapped.keyType == publicKey.keyType &&
                    otherWrapped.asHex() == publicKey.asHex();
            }

            // XXX: best effort
            return this.toBase64() == other.toBase64();
        },

        toBase64(): string {
            return b64encode(publicKey.bytes);
        },

        toBytes(): Uint8Array {
            return publicKey.bytes;
        },

        toString(): string {
            return this.toBase64();
        },

        toSuiAddress(): string {
            if (publicKey.keyType !== "ed25519") {
                throw new Error(
                    `Cannot derive address from key type "${publicKey.keyType}"`,
                );
            }

            return toSuiAddress(this.__wrapped as PublicKey<"ed25519">);
        },
    });
}

export function toSuiAddress(publicKey: PublicKey<"ed25519">): string {
    if (publicKey.keyType !== "ed25519") {
        throw new Error(
            `Cannot derive address from key type "${publicKey.keyType}"`,
        );
    }

    const buf = new Uint8Array(ed25519PublicKey.PUBLIC_KEY_SIZE + 1);
    buf.set([SIGNATURE_SCHEME_TO_FLAG["ED25519"]]);
    buf.set(publicKey.bytes, 1);

    return normalizeSuiAddress(
        bytesToHex(blake2b(buf, { dkLen: 32 })).slice(
            0,
            SUI_ADDRESS_LENGTH * 2,
        ),
    );
}
