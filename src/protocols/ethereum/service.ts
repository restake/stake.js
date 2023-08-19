import { ProtocolService } from "../../services/index.ts";
import { SignerWallet } from "../../wallets/index.ts";
import { EthereumTransactionEngine } from "./transactionEngine.ts";
import { EthereumDepositData, EthereumNetwork } from "./types.ts";

export class EthereumService extends ProtocolService<EthereumTransactionEngine> {
    tx: EthereumTransactionEngine;

    constructor(network: EthereumNetwork = "mainnet", rpcUrl?: URL) {
        super();
        this.tx = new EthereumTransactionEngine(network, rpcUrl);
    }

    async stake(wallet: SignerWallet, depositData: EthereumDepositData): Promise<string> {
        const rawTx = await this.tx.buildStakeTx(wallet, depositData);
        const signedTx = await this.tx.sign(wallet, rawTx);
        const txId = await this.tx.broadcast(signedTx);

        return txId;
    }
}
