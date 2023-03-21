import { jsonrpc } from "../../utils/http.js";
import { EthereumSigner } from "./EthereumSigner.js";
import { SignedTransaction, Transaction } from "./EthereumTransaction.js";
import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { Transaction as EthTransaction } from "@ethereumjs/tx";
import { Common }  from "@ethereumjs/common";
import { encode as b64Encode, decode as b64Decode } from "../../utils/base64.js";


export type EthereumBroadcastResponse = string;

export class EthereumProtocol implements TransactionBroadcaster<SignedTransaction, EthereumBroadcastResponse> {
    static INSTANCE = new EthereumProtocol();

    private constructor() {
        // no-op
    }

    async transfer(
        signer: EthereumSigner,
        receiveAddress: string,
        amount: BigInt,
    ): Promise<Transaction>{
        const senderAddress = await signer.getAddress();
        const gasPrice = await signer.fetchGasPrice();
        const block = await signer.fetchBlockHash("latest");
        const nonce = await signer.fetchNonce(senderAddress);
        const chainId = signer.network.chainId;

        const chainParams = {
            name: 'testnetwork',
            networkId: chainId,
            chainId: chainId,
            url: signer.network.rpcUrl,
            comment: "Test Local Chain"
        };

        const customCommon = Common.custom(chainParams);

        const txParams = {
            nonce: "0x" + nonce.toString(16),
            gasPrice: "0x" + gasPrice.toString(16),
            gasLimit: block.gasLimit,
            to: receiveAddress,
            value: "0x" + amount.toString(16),
        }

        const payload = EthTransaction.fromTxData(txParams, { common: customCommon });

        return {
            payload,
            network: signer.network,
        };
    };



    /**
     * Broadcast the transaction using sendRawTransaction JSON-RPC method.
     * For more information: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction
     *
     * @param signedTransaction
     * @returns EthereumBroadcastResponse
     */
    async broadcast(signedTransaction: SignedTransaction): Promise<EthereumBroadcastResponse> {
        const endpoint = new URL(signedTransaction.transaction.network.rpcUrl);
        const serializedTx = signedTransaction.payload.serialize();

        const response = await jsonrpc<EthereumBroadcastResponse>(endpoint, "eth_sendRawTransaction", [
            "0x" + serializedTx.toString("hex")
        ]);

        return response;
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);
        return response;
    }
}
