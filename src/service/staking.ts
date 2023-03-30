import { NetworkConfig } from "./network.js";
import { createProxy } from "./staking.proxy.js";
import { AvalancheStakingProtocol, NEARStakingProtocol, EthereumStakingProtocol } from "../protocol/interfaces/index.js";

export class StakingService {
    #networkConfig: NetworkConfig;

    #avalanche: AvalancheStakingProtocol;
    #ethereum: EthereumStakingProtocol;
    #near: NEARStakingProtocol;

    constructor(networkConfig?: NetworkConfig) {
        this.#networkConfig = networkConfig ?? {};

        this.#avalanche = createProxy<AvalancheStakingProtocol>("@restake/staking-sdk/protocol/avalanche", [
            this.#networkConfig
        ], [
            "stake",
        ]);
        this.#ethereum = createProxy<EthereumStakingProtocol>("@restake/staking-sdk/protocol/ethereum", [
            this.#networkConfig
        ], [
            "stake",
        ]);
        this.#near = createProxy<NEARStakingProtocol>("@restake/staking-sdk/protocol/near", [
            this.#networkConfig
        ], [
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
