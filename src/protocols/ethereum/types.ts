import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { ETHEREUM_NETWORKS } from "./constants";

export type EthereumNetwork = typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS];
export type EthereumRawTransaction = Omit<FeeMarketEIP1559Transaction, "v" | "r" | "s">;
export type EthereumSignedTransaction = FeeMarketEIP1559Transaction;
