import * as fs from "fs";
import "dotenv/config";
import { NearProtocolService } from "@restake/stake.js-near-protocol";
import { FireblocksWallet } from "@restake/stake.js-fireblocks";

const near = new NearProtocolService({ name: "mainnet" });

const apiKey = fs.readFileSync("./secrets/api-key.txt", "utf8").trim();
const apiSecret = fs.readFileSync("./secrets/api-secret.txt", "utf8").trim();
const vaultId = process.env["FIREBLOCKS_VAULT_ID"] || "1";

const wallet = new FireblocksWallet(apiKey, apiSecret, vaultId);

const rawTx = await near.tx.buildStakeTx(wallet, "restake.poolv1.near", 100);
console.log(rawTx.transaction);

const signedTx = await near.tx.sign(wallet, rawTx);
console.log(signedTx.transaction);

const txId = await near.tx.broadcast(signedTx);
console.log(txId);
