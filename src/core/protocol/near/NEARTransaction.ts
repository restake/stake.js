import { NEARNetwork } from "./network.ts";
import { SignedTransaction as NEARSignedTransaction, Transaction as NEARTransaction } from "near-api-js/lib/transaction.ts";

export type Transaction = {
    network: NEARNetwork;
    payload: NEARTransaction;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: NEARSignedTransaction;
};
