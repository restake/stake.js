import { Transaction } from "ethers";
import { ETHEREUM_NETWORKS } from "./constants";

export type EthereumNetwork = typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS];
export type EthereumRawTransaction = Omit<Transaction, "signature">;
export type EthereumSignedTransaction =  Omit<Transaction, "signature"> & { signature: string };
