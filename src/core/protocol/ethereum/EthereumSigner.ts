import { EthereumNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./EthereumTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";
import type { Signer } from "../../signer/signer.js";

import Web3 from "web3";
import { BlockTransactionString } from "web3-eth";
import { Account } from "web3-core";

export class EthereumSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: EthereumNetwork;
    #ethereum: Web3

    constructor(parent: secp256k1Signer, network: EthereumNetwork) {
        this.#parent = parent;
        this.#network = network;
        this.#ethereum = new Web3(network.rpcUrl);
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const privateKey = Buffer.from(this.#parent.getPrivateBytes());
        const signedTxn = transaction.payload.sign(privateKey);

        return {
            transaction,
            payload: signedTxn,
        };
    }

    get network(): EthereumNetwork {
        return this.#network;
    }

    async fetchNonce(): Promise<number> {
        const address = await this.getAddress();
        const nonce = await this.#ethereum.eth.getTransactionCount(address);

        return nonce;
    }

    async fetchBlockHash(): Promise<BlockTransactionString> {
        const block = await this.#ethereum.eth.getBlock("latest");
        return block;
    }

    async getAddress(): Promise<string> {
        const privateKey = new TextDecoder("utf-8").decode(this.#parent.getPrivateBytes());
        const address = this.#ethereum.eth.accounts.privateKeyToAccount(privateKey);

        return address.address;
    }
}
