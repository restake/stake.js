Promise.all([import("@restake/stake.js"),import("@restake/stake.js/wallet/filesystem")]).then(([{default:S},{default:F}])=>new S().near.stake(new F("key.json"),"restake.poolv1.near","0.1"));
