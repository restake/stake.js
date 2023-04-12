import { Wallet } from "../../wallet/index.js";

export interface EthereumStakingProtocol {
    stake(wallet: Wallet): Promise<string>;
}

export interface EthereumStakeParameters {
    amount: string;
    withdrawalCredentials: string;
    validatorSignature: string;
    depositDataRoot: string;
}
