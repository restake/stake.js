export interface AvalancheNetwork {
    id: string;
    rpcUrl: string;
    networkId: number;
}

export const _networks = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://api.avax.network",
        networkId: 0,
    },
    "testnet": {
        id: "fuji",
        rpcUrl: "https://api.avax-test.network",
        networkId: 5,
    },
} as const;

export type AvalancheNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in AvalancheNetworkID]: AvalancheNetwork };

export type AvalancheChainID = "C" | "P" | "X";
