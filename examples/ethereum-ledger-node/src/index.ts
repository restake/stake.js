import * as fs from "fs";
import { EthereumDepositData, EthereumService } from "@restake/stake.js-ethereum";
import { LedgerNodeWallet } from "@restake/stake.js-ledger-node";

const ethereum = new EthereumService({ name: "goerli" });

const depositData = EthereumDepositData.parse(JSON.parse(fs.readFileSync("./secrets/deposit-data.json", "utf8"))[0]);

const wallet = new LedgerNodeWallet();

const rawTx = await ethereum.tx.buildStakeTx(wallet, depositData);
console.log(rawTx.transaction.toJSON());

const signedTx = await ethereum.tx.sign(wallet, rawTx);
console.log(signedTx.transaction.toJSON());

const txId = await ethereum.tx.broadcast(signedTx);
console.log(txId);
