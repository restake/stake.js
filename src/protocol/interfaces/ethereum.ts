import { Wallet } from "../../wallet/index.js";

export interface EthereumStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}
