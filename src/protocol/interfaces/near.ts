import { Wallet } from "../../wallet/index.js";

export interface NEARStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
    unstake(wallet: Wallet): Promise<string>;
    withdraw(wallet: Wallet): Promise<string>;
}
