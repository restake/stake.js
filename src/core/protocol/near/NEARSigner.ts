import { Transaction as NEARTransaction, signTransaction } from "near-api-js/lib/transaction.js";
import { BlockFinality, NEARNetwork } from "./network.js";
import { SignedTransaction, Transaction } from "./NEARTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";
import type { Signer } from "../../signer/signer.js";
import { ed25519Signer } from "../../signer/ed25519Signer.js";
import { encode as b64encode } from "../../utils/base64.js";

import { Near, Signer as NearAPISigner } from "near-api-js";
import { PublicKey as NEARPublicKey, Signature } from "near-api-js/lib/utils/key_pair.js";

export class NEARSigner extends NearAPISigner implements Signer<Uint8Array, Uint8Array>, TransactionSigner<Transaction, SignedTransaction> {
    #parent: ed25519Signer;
    #network: NEARNetwork;
    #accountId: string;
    #currentNonce: BigInt | null = null;
    #near: Near;

    // Flag to update nonce
    #dirtyState: boolean = false;

    constructor(parent: ed25519Signer, accountId: string, network: NEARNetwork) {
        super();

        this.#parent = parent;
        this.#accountId = accountId;
        this.#network = network;
        this.#near = new Near({
            networkId: network.id,
            nodeUrl: network.rpcUrl,
        });
    }

    async sign(payload: Uint8Array | NEARTransaction): Promise<Uint8Array> {
        if (payload instanceof NEARTransaction) {
            this.#currentNonce = await this.fetchNonce();
            const [_, signedTxn] = await signTransaction(payload, this, this.#accountId, this.#network.id);
            // don't need to set #dirtyState here - signTransaction calls this function eventually
            return signedTxn.signature.data;
        } else {
            const signature = await this.#parent.sign(payload);
            this.#dirtyState = true;
            return signature;
        }
    }

    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        return this.#parent.verify(payload, signature);
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const [_raw, signedTxn] = await signTransaction(transaction.payload, this);
        return {
            transaction,
            payload: signedTxn,
        };
    }

    async fetchNonce(): Promise<BigInt> {
        let currentNonce = this.#currentNonce;
        if (this.#dirtyState || !currentNonce) {
            // TODO: fetch
            currentNonce = this.#currentNonce = -1n;
            this.#dirtyState = false;
        }

        return currentNonce;
    }

    async fetchBlockHash(type: BlockFinality): Promise<string> {
        return "";
    }

    get accountId(): string {
        return this.#accountId;
    }

    get network(): NEARNetwork {
        return this.#network;
    }

    async nearPublicKey(): Promise<NEARPublicKey> {
        const publicKey = await this.#parent.getPublicKey();
        const np = NEARPublicKey.fromString("ed25519:" + b64encode(publicKey.getBytes()));
        return np;
    }

    createKey(accountId: string, networkId?: string | undefined): Promise<NEARPublicKey> {
        throw new Error("Method not implemented.");
    }

    getPublicKey(accountId?: string | undefined, networkId?: string | undefined): Promise<NEARPublicKey> {
        return this.nearPublicKey();
    }

    async signMessage(message: Uint8Array, accountId?: string | undefined, networkId?: string | undefined): Promise<Signature> {
        const publicKey = await this.nearPublicKey();
        const signature = await this.#parent.sign(message);

        return {
            signature,
            publicKey,
        };
    }
}
