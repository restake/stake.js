import { Wallet } from "../../wallet/index.js";

export interface AvalancheStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}
