import { Wallet } from "../../wallet/index.ts";

export interface EthereumStakingProtocol {
    stake(wallet: Wallet, depositData: string): Promise<string[]>;
}
