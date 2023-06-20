export type StakeObject = {
    stakedSuiId: string;
    stakeRequestEpoch: string;
    stakeActiveEpoch: string;
    principal: string;
    status: "Active" | "Pending" | "Unstaked";
    estimatedReward?: string;
};

export type DelegatedStake = {
    validatorAddress: string;
    stakingPool: string;
    stakes: StakeObject[];
};
