import { Wallet } from "../../wallet/index.ts";

export interface AvalancheStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}
