import { StakingService, Wallet } from "@restake/staking-sdk";
import { FilesystemWallet } from "@restake/staking-sdk/wallet/filesystem";

const wallet: Wallet = new FilesystemWallet("key.json");

const rstk = new StakingService("mainnet");
const txId = await rstk.near.stake(wallet, "restake.poolv1.near", 100000000000000000000000n);
console.log("txId", txId);
