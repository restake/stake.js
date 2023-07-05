import { StakingService, Wallet } from "@restake/stake.js";
import { FilesystemWallet } from "@restake/stake.js/wallet/filesystem";
import { readFile } from "fs/promises";

const wallet: Wallet = new FilesystemWallet("key.json");

const depositData = await readFile("./keys/eth-deposit-data.json", { encoding: "utf-8" });

const rstk = new StakingService("mainnet");
const txIds = await rstk.ethereum.stake(wallet, depositData);

console.log("txIds", txIds);
