import { Wallet } from "../../wallet/index.ts";

export interface NEARStakingProtocol {
    stake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string,
    ): Promise<string>;

    unstake(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string | "all",
    ): Promise<string>;

    withdraw(
        wallet: Wallet,
        stakingPoolAccountId: string,
        amount: string | "all",
    ): Promise<string>;
}
