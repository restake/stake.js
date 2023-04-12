import { StakingService, Wallet } from "@restake/stake.js";
import { FireblocksWallet } from "@restake/stake.js/wallet/fireblocks";

import { readFile } from "node:fs/promises";

const { key: apiKey, secret: apiSecret } = await readFile("./fireblocks.json", { encoding: "utf-8" }).then((str) => {
    return JSON.parse(str);
});

const accountId = "8"; // Account with name "Staking Development"
const wallet: Wallet = new FireblocksWallet(apiKey, apiSecret, accountId);

const rstk = new StakingService("mainnet");
const txId = await rstk.near.stake(wallet, "restake.poolv1.near", "0.1");
console.log("txId", txId);
