import { ProtocolService } from "../../services/index.ts";
import { SignerWallet } from "../../wallets/index.ts";
import { NearProtocolTransactionEngine } from "./transactionEngine.ts";
import { NearProtocolNetwork } from "./types.ts";

export class NearProtocolService extends ProtocolService<NearProtocolTransactionEngine> {
    tx: NearProtocolTransactionEngine;

    constructor(network: NearProtocolNetwork = "mainnet", rpcUrl?: URL) {
        super();
        this.tx = new NearProtocolTransactionEngine(network, rpcUrl);
    }

    async stake(
        wallet: SignerWallet,
        validator: string,
        amount: number,
        accountId?: string,
        selector?: string,
    ): Promise<string> {
        const rawTx = await this.tx.buildStakeTx(wallet, validator, amount, accountId, selector);
        const signedTx = await this.tx.sign(wallet, rawTx);
        const txId = await this.tx.broadcast(signedTx);

        return txId;
    }

    async withdraw(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string,
    ): Promise<string> {
        const rawTx = await this.tx.buildWithdrawTx(wallet, validator, amount, accountId, selector);
        const signedTx = await this.tx.sign(wallet, rawTx);
        const txId = await this.tx.broadcast(signedTx);

        return txId;
    }

    async unstake(
        wallet: SignerWallet,
        validator: string,
        amount: number | "all",
        accountId?: string,
        selector?: string): Promise<string> {
        const rawTx = await this.tx.buildUnstakeTx(wallet, validator, amount, accountId, selector);
        const signedTx = await this.tx.sign(wallet, rawTx);
        const txId = await this.tx.broadcast(signedTx);

        return txId;
    }
}
