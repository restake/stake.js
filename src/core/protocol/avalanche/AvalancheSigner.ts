import { AvalancheNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./AvalancheTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";
import type { Signer } from "../../signer/signer.js";

import { Avalanche } from "avalanche";
import { bech32 } from "bech32";
import { Buffer } from "buffer/";

export class AvalancheSigner implements Signer<Uint8Array, Uint8Array>, TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: AvalancheNetwork;
    #avalanche: Avalanche;

    constructor(parent: secp256k1Signer, network: AvalancheNetwork) {
        this.#parent = parent;
        this.#network = network;
        this.#avalanche = AvalancheSigner.getClient(network.id, network.rpcUrl, network.networkId);

        const pKeyChain = this.#avalanche.PChain().keyChain();
        pKeyChain.importKey(Buffer.from(this.#parent.getPrivateBytes()));
    }

    async deriveAddress(chainID: string): Promise<string> {
        const publicKey = await this.#parent.getPublicKey();
        const networkID = this.#network.id;
        return `${chainID}-${bech32.encode(networkID, publicKey.getBytes())}`;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {
        return this.#parent.sign(payload);
    }

    async signTransaction(transaction: Transaction): Promise <SignedTransaction>{
        const pKeyChain = this.#avalanche.PChain().keyChain();
        const signedTxn = transaction.payload.sign(pKeyChain)

        return {
            transaction,
            payload: signedTxn
        };
    }

    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {
        return this.#parent.verify(payload, signature);
    }

    get client(): Avalanche {
        return this.#avalanche;
    }

    get network(): AvalancheNetwork {
        return this.#network;
    }

    private static getClient(rpcUrl: string, network: string, networkId: number): Avalanche {
        const url = new URL(rpcUrl);

        const client = new Avalanche(
            url.hostname,
            parseInt(url.port),
            url.protocol.replace(':', ''),
            networkId,
            undefined,
            undefined,
            network,
        );

        // @ts-ignore
        client.setRequestConfig("validateStatus", (status) => {
            return true;
        });

        return client;
    }

}
