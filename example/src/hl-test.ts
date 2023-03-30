import { StakingService, Wallet } from "@restake/staking-sdk";

const wallet: Wallet = {};

const rstk = new StakingService({
    near: {
        networkName: "mainnet",
    },
});

const txId = await rstk.near.stake(wallet, "restake.poolv1.near", 100000000000000000000000n);
console.log("txId", txId);
