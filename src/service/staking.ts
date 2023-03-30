import { NetworkName, NetworkConfig } from "./network.js";
import { createProxy } from "./staking.proxy.js";
import { AvalancheStakingProtocol, NEARStakingProtocol, EthereumStakingProtocol } from "../protocol/interfaces/index.js";

export class StakingService {
    #networkConfig: NetworkConfig;

    #avalanche: AvalancheStakingProtocol;
    #ethereum: EthereumStakingProtocol;
    #near: NEARStakingProtocol;

    constructor(
        networkConfigOrNetworkName?: NetworkConfig | NetworkName,
        networkConfig?: NetworkConfig,
    ) {
        // Don't allow users to pass network config twice
        if (typeof networkConfigOrNetworkName === "object" && networkConfig) {
            throw new Error("Pass network config object only once");
        }

        const hasNetworkName = typeof networkConfigOrNetworkName === "string";
        const networkName = hasNetworkName ? networkConfigOrNetworkName : "mainnet";
        if (hasNetworkName) {
            this.#networkConfig = {
                avalanche: networkConfig?.avalanche ?? hasNetworkName ? { networkName } : undefined,
                ethereum: networkConfig?.ethereum ?? hasNetworkName ? { networkName } : undefined,
                near: networkConfig?.near ?? hasNetworkName ? { networkName } : undefined,
            };
        } else {
            this.#networkConfig = networkConfigOrNetworkName ?? {};
        }

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
