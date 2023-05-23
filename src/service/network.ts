import type { StakingService } from "./staking.ts";

export type NetworkName = "mainnet" | "testnet";

export type RawRPCNetworkConfig = {
    rpcEndpoint: string;
};

export function isRawRPCNetworkConfig(t: NetworkConfig[keyof StakingService]): t is RawRPCNetworkConfig {
    return t !== undefined && "rpcEndpoint" in t && t.rpcEndpoint !== undefined;
}

export type NamedNetworkConfig = {
    networkName: NetworkName;
};

export function isNamedNetworkConfig(t: NetworkConfig[keyof StakingService]): t is NamedNetworkConfig {
    return t !== undefined && "networkName" in t && t.networkName !== undefined;
}

export type NetworkConfig = {
    [protocol in keyof StakingService]?: RawRPCNetworkConfig | NamedNetworkConfig;
};
