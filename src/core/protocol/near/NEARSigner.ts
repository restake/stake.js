import { BlockFinality, NEARNetwork, isFinality } from "./network.js";
import { ed25519Signer } from "../../signer/ed25519Signer.js";
import { jsonrpc } from "../../utils/http.js";
import { SignedTransaction, Transaction } from "./NEARTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";

import { PublicKey as NEARPublicKey, Signature } from "near-api-js/lib/utils/key_pair.js";
import { sha256 } from "@noble/hashes/sha256";
import { Signer as NearAPISigner } from "near-api-js";
import { signTransaction as nearSignTransaction } from "near-api-js/lib/transaction.js";

export class NEARSigner implements TransactionSigner<Transaction, SignedTransaction> {
    #parent: ed25519Signer;
    #network: NEARNetwork;
    #accountId: string;
    #signerImpl: NearAPISignerImpl;
    #currentNonce: bigint | null = null;

    // Flag to update nonce
    #dirtyState: boolean = false;

    constructor(parent: ed25519Signer, accountId: string | null | undefined, network: NEARNetwork) {
        this.#parent = parent;
        this.#accountId = typeof accountId === "string" ? accountId : parent.publicKey.asHex();
        this.#network = network;
        this.#signerImpl = new NearAPISignerImpl(
            (() => this.nearPublicKey).bind(this),
            ((msg: Uint8Array) => this.#parent.sign(msg)).bind(this)
        );
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_raw, signedTxn] = await nearSignTransaction(transaction.payload, this.#signerImpl);
        this.#dirtyState = true;

        return {
            transaction,
            payload: signedTxn,
        };
    }

    async fetchNonce(block: BlockFinality | string = "final"): Promise<bigint> {
        type AccessKeyResponse = {
            error?: string;
            nonce?: number;
        };

        let nonce: bigint;
        const currentNonce = this.#currentNonce;
        if (this.#dirtyState || !currentNonce) {
            this.#currentNonce = nonce = await jsonrpc<AccessKeyResponse>(this.#network.rpcUrl, "query", {
                request_type: "view_access_key",
                finality: isFinality(block) ? block : undefined,
                block_id: !isFinality(block) ? block : undefined,
                account_id: this.#accountId,
                public_key: this.nearPublicKey.toString(),
            }).then((response) => {
                if (response.error) {
                    throw new Error(response.error);
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return BigInt(response.nonce!);
            });
            this.#dirtyState = false;
        } else {
            nonce = currentNonce;
        }

        return nonce;
    }

    async fetchBlockHash(block: BlockFinality | string = "final"): Promise<string> {
        type BlockResponse = {
            header: {
                hash: string;
            };
        };

        return await jsonrpc<BlockResponse>(this.#network.rpcUrl, "block", {
            finality: isFinality(block) ? block : undefined,
            block_id: !isFinality(block) ? block : undefined,
        }).then((response) => {
            return response.header.hash;
        });
    }

    /**
     * Gets current accountId
     */
    get accountId(): string {
        return this.#accountId;
    }

    /**
     * Gets current NEAR network
     */
    get network(): NEARNetwork {
        return this.#network;
    }

    get nearPublicKey(): NEARPublicKey {
        return new NEARPublicKey({ keyType: 0, data: this.#parent.publicKey.bytes });
    }
}

class NearAPISignerImpl extends NearAPISigner {
    #getPublicKeyFn: () => NEARPublicKey;
    #signFn: (msg: Uint8Array) => Promise<Uint8Array>;

    constructor(
        getPublicKeyFn: () => NEARPublicKey,
        signFn: (msg: Uint8Array) => Promise<Uint8Array>,
    ) {
        super();
        this.#getPublicKeyFn = getPublicKeyFn;
        this.#signFn = signFn;
    }

    createKey(_accountId: string, _networkId?: string | undefined): Promise<NEARPublicKey> {
        throw new Error("Method not implemented.");
    }

    getPublicKey(_accountId?: string | undefined, _networkId?: string | undefined): Promise<NEARPublicKey> {
        return Promise.resolve(this.#getPublicKeyFn());
    }

    async signMessage(message: Uint8Array, _accountId?: string | undefined, _networkId?: string | undefined): Promise<Signature> {
        const publicKey = this.#getPublicKeyFn();
        const signature = await this.#signFn(sha256(message));

        return {
            signature,
            publicKey,
        };
    }
}
