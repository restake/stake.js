import { SuiSigner } from "./SuiSigner.js";
import { Transaction } from "./SuiTransaction.js";

export class SuiProtocol {
    static INSTANCE = new SuiProtocol();

    private constructor() {
        // No-op
    }

    async createTransferTransaction(
        _signer: SuiSigner,
        _sender: string,
        _recipient: string,
        _amount: bigint,
    ): Promise<Transaction> {
        throw new Error("not implemented");
    }
}
