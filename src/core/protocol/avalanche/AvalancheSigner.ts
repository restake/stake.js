import { AvalancheChainID, AvalancheNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./AvalancheTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";

import { Avalanche, Buffer } from "avalanche";
import { bech32 } from "bech32";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";

export class AvalancheSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: AvalancheNetwork;
    #avalanche: Avalanche;

    constructor(parent: secp256k1Signer, network: AvalancheNetwork) {
        this.#parent = parent;
        this.#network = network;
        this.#avalanche = AvalancheSigner.getClient(network.rpcUrl, network.id, network.networkId);

        const pKeyChain = this.#avalanche.PChain().keyChain();
        pKeyChain.importKey(Buffer.from(this.#parent.getPrivateBytes()));
    }

    deriveAddress(chainID: string): string {
        const publicKey = this.#parent.publicKey;
        const networkID = this.#network.id;

        // The 33-byte compressed representation of the public key is hashed with sha256 once.
        // The result is then hashed with ripemd160 to yield a 20-byte address.
        const hash = ripemd160(sha256(publicKey.compressedBytes));
        const words = bech32.toWords(hash);
        return `${chainID}-${bech32.encode(networkID, words)}`;
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const pKeyChain = this.#avalanche.PChain().keyChain();
        const signedTxn = transaction.payload.sign(pKeyChain);

        /*
        const txBuffer = transaction.payload.toBuffer();
        const message = sha256(txBuffer);
        */

        return {
            transaction,
            payload: signedTxn
        };
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

        return client;
    }

}
