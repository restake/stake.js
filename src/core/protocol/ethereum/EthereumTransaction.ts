import { EthereumNetwork } from "./network.js";
import Web3 from "web3";
import { Transaction as UnsignedTx } from "web3-core";
import { Transaction as Tx } from "web3-core"; //TO-DO Look into unsigned and signed transaction imports

export type Transaction = {
    network: EthereumNetwork;
    payload: UnsignedTx;
};

export type SignedTransaction = {
    transaction: Transaction;
    payload: Tx;
}
