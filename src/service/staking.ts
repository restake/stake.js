import { createProxy } from "./staking.proxy.js";
import { AvalancheStakingProtocol, NEARStakingProtocol, EthereumStakingProtocol } from "../protocol/interfaces/index.js";

export class StakingService {
    //#identifier: string;
    #avalanche: AvalancheStakingProtocol;
    #ethereum: EthereumStakingProtocol;
    #near: NEARStakingProtocol;

    constructor() {
        this.#avalanche = createProxy<AvalancheStakingProtocol>("@restake/staking-sdk/protocol/avalanche", [
            "stake",
        ]);
        this.#ethereum = createProxy<EthereumStakingProtocol>("@restake/staking-sdk/protocol/ethereum", [
            "stake",
        ]);
        this.#near = createProxy<NEARStakingProtocol>("@restake/staking-sdk/protocol/near", [
            "stake",
            "unstake",
            "withdraw",
        ]);
    }

    get avalanche(): AvalancheStakingProtocol {
        return this.#avalanche;
    }

    get ethereum(): EthereumStakingProtocol {
        return this.#ethereum;
    }

    get near(): NEARStakingProtocol {
        return this.#near;
    }
}
