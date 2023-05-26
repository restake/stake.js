import { TransactionBroadcaster } from "../../network/broadcaster.js";
import { jsonrpc } from "../../utils/http.js";
import { SuiSigner } from "./SuiSigner.js";
import { SignedTransaction, Transaction } from "./SuiTransaction.js";

import { SuiTransactionBlockResponse, TransactionBlock } from "@mysten/sui.js";

export type SuiBroadcastResponse = SuiTransactionBlockResponse;

export class SuiProtocol implements TransactionBroadcaster<SignedTransaction, SuiBroadcastResponse> {
    static INSTANCE = new SuiProtocol();

    private constructor() {
        // No-op
    }

    async createTransferTransaction(
        signer: SuiSigner,
        recipientAddress: string,
        amount: bigint,
        baseTx?: TransactionBlock,
        senderAddress?: string,
    ): Promise<Transaction> {
        const tx = new TransactionBlock(baseTx);
        const [ coin ] = tx.splitCoins(tx.gas, [
            tx.pure(Number(amount)),
        ]);

        tx.transferObjects([ coin ], tx.pure(recipientAddress));

        if (senderAddress) {
            tx.setSender(senderAddress);
        }

        return {
            network: signer.network,
            payload: tx,
        };
    }

    async broadcast(signedTransaction: SignedTransaction): Promise<SuiBroadcastResponse> {
        // https://docs.sui.io/sui-jsonrpc#sui_executeTransactionBlock

        const endpoint = new URL(signedTransaction.transaction.network.rpcUrl);

        const { transactionBlockBytes, signature } = signedTransaction.payload;
        const signatures = Array.isArray(signature) ? signature : [signedTransaction.payload.signature];

        return jsonrpc<SuiBroadcastResponse>(endpoint, "sui_executeTransactionBlock", [
            transactionBlockBytes,
            signatures,
            null,
            null,
        ]);
    }

    async broadcastSimple(signedTransaction: SignedTransaction): Promise<string> {
        const response = await this.broadcast(signedTransaction);

        return response.digest;
    }
}
