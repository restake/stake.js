import { BlockFinality, NEARNetwork, isFinality } from "./network.js";
import { ed25519Signer } from "../../signer/ed25519Signer.js";
import { jsonrpc } from "../../utils/http.js";
import { SignedTransaction, Transaction } from "./NEARTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";

import bs58 from "bs58";
import { Signer as NearAPISigner } from "near-api-js";
import { signTransaction as nearSignTransaction } from "near-api-js/lib/transaction.js";
import { PublicKey as NEARPublicKey, Signature } from "near-api-js/lib/utils/key_pair.js";

export class NEARSigner implements TransactionSigner<Transaction, SignedTransaction> {
    #parent: ed25519Signer;
    #network: NEARNetwork;
    #accountId: string;
    #nPublicKey: NEARPublicKey;
    #signerImpl: NearAPISignerImpl;
    #currentNonce: BigInt | null = null;

    // Flag to update nonce
    #dirtyState: boolean = false;

    constructor(parent: ed25519Signer, accountId: string, network: NEARNetwork) {
        this.#parent = parent;
        this.#accountId = accountId;
        this.#network = network;
        this.#nPublicKey = NEARPublicKey.fromString("ed25519:" + bs58.encode(this.#parent.getPublicKey().getBytes()));
        this.#signerImpl = new NearAPISignerImpl(() => this.#nPublicKey, this.#parent.sign);
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const [_raw, signedTxn] = await nearSignTransaction(transaction.payload, this.#signerImpl);
        this.#dirtyState = true;
        return {
            transaction,
            payload: signedTxn,
        };
    }

    async fetchNonce(block: BlockFinality | string = "final"): Promise<BigInt> {
        type AccessKeyResponse = {
            error?: string;
            nonce?: number;
        };

        let nonce: BigInt;

        let currentNonce = this.#currentNonce;
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
        return this.#nPublicKey;
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

    createKey(accountId: string, networkId?: string | undefined): Promise<NEARPublicKey> {
        throw new Error("Method not implemented.");
    }

    getPublicKey(accountId?: string | undefined, networkId?: string | undefined): Promise<NEARPublicKey> {
        return Promise.resolve(this.#getPublicKeyFn());
    }

    async signMessage(message: Uint8Array, accountId?: string | undefined, networkId?: string | undefined): Promise<Signature> {
        const publicKey = await this.#getPublicKeyFn();
        const signature = await this.#signFn(message);

        return {
            signature,
            publicKey,
        };
    }
}
