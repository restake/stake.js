import { NetworkName, NetworkConfig } from "./network.js";
import { createProxy } from "./staking.proxy.js";
import { AvalancheStakingProtocol, NEARStakingProtocol, EthereumStakingProtocol } from "../protocol/interfaces/index.js";

export class StakingService {
    __networkConfig: NetworkConfig;

    __avalanche: AvalancheStakingProtocol;
    __ethereum: EthereumStakingProtocol;
    __near: NEARStakingProtocol;

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
            this.__networkConfig = {
                avalanche: networkConfig?.avalanche ?? hasNetworkName ? { networkName } : undefined,
                ethereum: networkConfig?.ethereum ?? hasNetworkName ? { networkName } : undefined,
                near: networkConfig?.near ?? hasNetworkName ? { networkName } : undefined,
            };
        } else {
            this.__networkConfig = networkConfigOrNetworkName ?? {};
        }

        this.__avalanche = createProxy<AvalancheStakingProtocol>("@restake/stake.js/protocol/avalanche", [
            this.__networkConfig,
        ], [
            "stake",
        ]);
        this.__ethereum = createProxy<EthereumStakingProtocol>("@restake/stake.js/protocol/ethereum", [
            this.__networkConfig,
        ], [
            "stake",
        ]);
        this.__near = createProxy<NEARStakingProtocol>("@restake/stake.js/protocol/near", [
            this.__networkConfig,
        ], [
            "stake",
            "unstake",
            "withdraw",
        ]);
    }

    get avalanche(): AvalancheStakingProtocol {
        return this.__avalanche;
    }

    get ethereum(): EthereumStakingProtocol {
        return this.__ethereum;
    }

    get near(): NEARStakingProtocol {
        return this.__near;
    }
}
