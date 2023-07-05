import { Wallet } from "../../wallet/index.ts";

export interface AvalancheStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}

export interface AvalancheStakeParameters {
    dateStart: Date;
    dateEnd: Date;
    rewardLockTime?: bigint;
}
