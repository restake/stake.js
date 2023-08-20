import * as fs from "fs";
import { EthereumDepositData, EthereumService, LedgerWallet } from "@restake/stake.js";

const ethereum = new EthereumService("goerli");

const depositData = EthereumDepositData.parse(JSON.parse(fs.readFileSync("./src/ethereum/secrets/deposit-data.json", "utf8"))[0]);

const wallet = new LedgerWallet();

const rawTx = await ethereum.tx.buildStakeTx(wallet, depositData);
console.log(rawTx.toJSON());

const signedTx = await ethereum.tx.sign(wallet, rawTx);
console.log(signedTx.toJSON());

const txId = await ethereum.tx.broadcast(signedTx);
console.log(txId);
