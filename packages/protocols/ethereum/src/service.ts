import { ProtocolService, SignerWallet } from "@restake/stakejs-core";
import { EthereumTransactionEngine } from "./transactionEngine.ts";
import { EthereumDepositData, EthereumNetwork } from "./types.ts";

export class EthereumService extends ProtocolService<EthereumTransactionEngine> {
    tx: EthereumTransactionEngine;

    constructor(network: EthereumNetwork = { name: "mainnet" }, rpcUrl?: URL) {
        super();
        this.tx = new EthereumTransactionEngine(network, rpcUrl);
    }

    async stake(wallet: SignerWallet, depositData: EthereumDepositData, selector?: string): Promise<string> {
        const rawTx = await this.tx.buildStakeTx(wallet, depositData, selector);
        const signedTx = await this.tx.sign(wallet, rawTx);
        const txId = await this.tx.broadcast(signedTx);

        return txId;
    }
}