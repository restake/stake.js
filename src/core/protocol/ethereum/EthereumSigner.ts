import { EthereumNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./EthereumTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";
import { jsonrpc } from "../../utils/http.js";

export type EthereumBlockResponse = {
    gasLimit: string;
};

export class EthereumSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: EthereumNetwork;

    constructor(parent: secp256k1Signer, network: EthereumNetwork) {
        this.#parent = parent;
        this.#network = network;
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

    async fetchNonce(senderAddress: string, block: number | "latest" | "earliest" | "pending" = "latest"): Promise<BigInt> {
        const endpoint = new URL(this.#network.rpcUrl);
        const nonce = await jsonrpc<string>(endpoint, "eth_getTransactionCount", [
            senderAddress,
            block,
        ]);

        return BigInt(nonce);
    }

    async fetchGasPrice(): Promise<BigInt> {
        const endpoint = new URL(this.#network.rpcUrl);
        const gasPrice = await jsonrpc<string>(endpoint, "eth_gasPrice", []);

        return BigInt(gasPrice);
    }

    async fetchBlockHash(blockNumber: string): Promise<EthereumBlockResponse> {
        const endpoint = new URL(this.#network.rpcUrl);
        return jsonrpc<EthereumBlockResponse>(endpoint, "eth_getBlockByNumber", [
            blockNumber,
            true,
        ]);
    }

    async getAddress(): Promise<string> {
        return "0x" + this.#parent.getPublicKey().address();
    }
}
