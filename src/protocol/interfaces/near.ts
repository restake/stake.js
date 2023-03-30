import { Wallet } from "../../wallet/index.js";

export interface NEARStakingProtocol {
    stake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt,
    ): Promise<string>;

    unstake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string>;

    withdraw(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: BigInt | "all",
    ): Promise<string>;
}
