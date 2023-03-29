import { EthereumNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { keccak_256 } from "@noble/hashes/sha3";
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

    async getDataRoot(pubkey: string, withdrawal_credentials: string, amount: bigint, signature: string): Promise<Uint8Array> {

        const pubkeyBytes = Buffer.from(pubkey.slice(2), 'hex');
        const pubkeyRoot = keccak_256(pubkeyBytes);

        const signatureBytes = Buffer.from(signature.slice(2), 'hex');
        const signatureRoot = keccak_256(Buffer.concat([
        keccak_256(signatureBytes.slice(0, 64)),
        keccak_256(Buffer.concat([signatureBytes.slice(64), Buffer.alloc(32)]))
        ]));

        const withdrawalCredentialBytes = Buffer.from(withdrawal_credentials.slice(2), 'hex');
        const amountBytes = Buffer.alloc(8);
        amountBytes.writeBigUInt64BE(amount);

        const depositDataBytes = Buffer.concat([
        pubkeyRoot,
        withdrawalCredentialBytes,
        amountBytes,
        signatureRoot
        ]);
        const depositDataRoot = keccak_256(depositDataBytes);

        return depositDataRoot;
    }

    async getAddress(): Promise<string> {
        return "0x" + this.#parent.getPublicKey().address();
    }
}
