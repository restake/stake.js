import { AvalancheNetwork } from "./network.ts";
import { UnsignedTx, Tx } from "avalanche/dist/apis/platformvm";

export type Transaction = {
    network: AvalancheNetwork;
    payload: UnsignedTx;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: Tx;
};
