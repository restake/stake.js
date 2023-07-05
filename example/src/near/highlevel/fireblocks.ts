import { StakingService, Wallet } from "@restake/stake.js";
import { FireblocksWallet } from "@restake/stake.js/wallet/fireblocks";

import { readFile } from "node:fs/promises";

const apiKey = await readFile("./keys/fireblocks-api-key.txt", { encoding: "utf-8" }).then((v) => v.trim());
const apiSecret = await readFile("./keys/fireblocks-secret.pem", { encoding: "utf-8" });
// https://console.fireblocks.io/v2/accounts/vault/${number}
const accountId = await readFile("./keys/fireblocks-account.txt", { encoding: "utf-8" }).then((v) => v.trim());

const wallet: Wallet = new FireblocksWallet(apiKey, apiSecret, accountId);

const rstk = new StakingService("testnet");
const txId = await rstk.near.stake(wallet, "restake.poolv1.near", "0.1");
console.log("txId", txId);
