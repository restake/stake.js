import { SuiNetwork } from "./network.js";

export type Transaction = {
    network: SuiNetwork;
    payload: unknown;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: unknown;
};
