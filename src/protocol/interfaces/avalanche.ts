import { Wallet } from "../../wallet/index.js";

export interface AvalancheStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}

export interface AvalancheStakeParameters {
    dateStart: Date;
    dateEnd: Date;
    rewardLockTime?: bigint;
}
