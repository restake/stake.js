import { BlockFinality, NEARNetwork, isFinality } from "./network.ts";
import { ed25519Signer } from "../../signer/ed25519Signer.ts";
import { jsonrpc } from "../../utils/http.ts";
import { SignedTransaction, Transaction } from "./NEARTransaction.ts";
import { TransactionSigner } from "../../signer/TransactionSigner.ts";

import { PublicKey as NEARPublicKey, Signature } from "near-api-js/lib/utils/key_pair.js";
import { sha256 } from "@noble/hashes/sha256";
import { Signer as NearAPISigner } from "near-api-js";
import { signTransaction as nearSignTransaction } from "near-api-js/lib/transaction.js";

export class NEARSigner implements TransactionSigner<Transaction, SignedTransaction> {
    __parent: ed25519Signer;
    __network: NEARNetwork;
    __accountId: string;
    __signerImpl: NearAPISignerImpl;
    __currentNonce: bigint | null = null;

    // Flag to update nonce
    __dirtyState: boolean = false;

    constructor(parent: ed25519Signer, accountId: string | null | undefined, network: NEARNetwork) {
        this.__parent = parent;
        this.__accountId = typeof accountId === "string" ? accountId : parent.publicKey.asHex();
        this.__network = network;
        this.__signerImpl = new NearAPISignerImpl(this);
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_raw, signedTxn] = await nearSignTransaction(transaction.payload, this.__signerImpl);
        this.__dirtyState = true;

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
        const currentNonce = this.__currentNonce;
        if (this.__dirtyState || !currentNonce) {
            this.__currentNonce = nonce = await jsonrpc<AccessKeyResponse>(this.__network.rpcUrl, "query", {
                request_type: "view_access_key",
                finality: isFinality(block) ? block : undefined,
                block_id: !isFinality(block) ? block : undefined,
                account_id: this.__accountId,
                public_key: this.nearPublicKey.toString(),
            }).then((response) => {
                if (response.error) {
                    throw new Error(response.error);
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return BigInt(response.nonce!);
            });
            this.__dirtyState = false;
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

        return await jsonrpc<BlockResponse>(this.__network.rpcUrl, "block", {
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
        return this.__accountId;
    }

    /**
     * Gets current NEAR network
     */
    get network(): NEARNetwork {
        return this.__network;
    }

    get nearPublicKey(): NEARPublicKey {
        return new NEARPublicKey({ keyType: 0, data: this.__parent.publicKey.bytes });
    }
}

class NearAPISignerImpl extends NearAPISigner {
    __parent: NEARSigner;

    constructor(
        parent: NEARSigner,
    ) {
        super();
        this.__parent = parent;
    }

    createKey(_accountId: string, _networkId?: string | undefined): Promise<NEARPublicKey> {
        throw new Error("Method not implemented.");
    }

    getPublicKey(_accountId?: string | undefined, _networkId?: string | undefined): Promise<NEARPublicKey> {
        return Promise.resolve(this.__parent.nearPublicKey);
    }

    async signMessage(message: Uint8Array, _accountId?: string | undefined, _networkId?: string | undefined): Promise<Signature> {
        const signature = await this.__parent.__parent.sign(sha256(message));

        return {
            signature,
            publicKey: this.__parent.nearPublicKey,
        };
    }
}
