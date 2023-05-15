import { SignedTransaction, Transaction } from "./SuiTransaction.js";
import { KeyType, Signer, TransactionSigner } from "../../signer/index.js";

import { RawSigner, Keypair } from "@mysten/sui.js";

export class SuiSigner implements TransactionSigner<Transaction, SignedTransaction> {
    constructor() {
        const k = new Keypair();
        const s = new RawSigner(null, null);

        throw new Error("not implemented");
    }

    async signTransaction(_transaction: Transaction): Promise<SignedTransaction> {
        throw new Error("not implemented");
    }
}

function convertKeypair<T extends KeyType>(signer: Signer<T>) {
    
}
