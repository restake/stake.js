import { StakingService, Wallet } from "@restake/staking-sdk";
import { FilesystemWallet } from "@restake/staking-sdk/wallet/filesystem";

const wallet: Wallet = new FilesystemWallet("key.json");

const rstk = new StakingService("testnet");
const amount0_1N = 100000000000000000000000n;
const txId = await rstk.near.stake(wallet, "shurik.pool.f863973.m0", amount0_1N);
console.log("txId", txId);
