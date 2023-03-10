import { NEARNetwork } from "./network.js";
import { SignedTransaction as NEARSignedTransaction, Transaction as NEARTransaction } from "near-api-js/lib/transaction.js";

export type Transaction = {
    network: NEARNetwork;
    payload: NEARTransaction;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: NEARSignedTransaction;
}
