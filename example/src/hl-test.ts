import { StakingService } from "@restake/staking-sdk";

const rstk = new StakingService();
// @ts-ignore
rstk.near.stake(null);
