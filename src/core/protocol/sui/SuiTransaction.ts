import { SuiNetwork } from "./network.js";

import {
    TransactionBlock as SuiTransactionBlock,
    SignedTransaction as SuiSignedTransaction,
} from "@mysten/sui.js";

export type Transaction = {
    network: SuiNetwork;
    payload: SuiTransactionBlock | Uint8Array;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: SuiSignedTransaction;
};
