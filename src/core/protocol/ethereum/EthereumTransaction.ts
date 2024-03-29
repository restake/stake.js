import { EthereumNetwork } from "./network.ts";
import { FeeMarketEIP1559Transaction as EthTransaction } from "@ethereumjs/tx";

export type Transaction = {
    network: EthereumNetwork;
    payload: EthTransaction;
};

export type SignedTransaction = {
    transaction: Transaction;
    // Has fields v, r, s set
    payload: EthTransaction;
};
