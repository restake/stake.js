import { SuiSigner } from "./SuiSigner.js";
import { Transaction } from "./SuiTransaction.js";

import { TransactionBlock } from "@mysten/sui.js";

export class SuiProtocol {
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
        const tx = baseTx ?? new TransactionBlock();
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
}
