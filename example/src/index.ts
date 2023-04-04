import { StakingService, Wallet } from "@restake/staking.js";
import { FilesystemWallet } from "@restake/staking.js/wallet/filesystem";

const wallet: Wallet = new FilesystemWallet("key.json");

const rstk = new StakingService("testnet");
const txId = await rstk.near.stake(wallet, "shurik.pool.f863973.m0", "0.1");
console.log("txId", txId);
