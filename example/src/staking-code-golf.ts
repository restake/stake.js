Promise.all([import("@restake/staking-sdk"),import("@restake/staking-sdk/wallet/provider/filesystem")]).then(([{default:S},{default:F}])=>new S().near.stake(new F("key.json"),"restake.poolv1.near",50n))

