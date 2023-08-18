import { Transaction } from "ethers";
import { ETHEREUM_NETWORKS } from "./constants";

export type EthereumNetwork = typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS];
export type EthereumRawTransaction = Omit<Transaction, "signature">;
export type EthereumSignedTransaction =  Omit<Transaction, "signature"> & { signature: string };

export type EthereumDepositData = {
    pubkey: string;
    withdrawal_credentials: string;
    amount: bigint;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
};
