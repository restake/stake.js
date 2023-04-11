import { StakingService, Wallet } from "@restake/stake.js";
import { FilesystemWallet } from "@restake/stake.js/wallet/filesystem";

const wallet: Wallet = new FilesystemWallet("key.json");

const rstk = new StakingService("testnet");
const txId = await rstk.near.stake(wallet, "shurik.pool.f863973.m0", "0.1");
console.log("txId", txId);
