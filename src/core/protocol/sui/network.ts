export interface SuiNetwork {
    id: string;
    rpcUrl: string;
    wsUrl?: string;
}

const _networks = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://fullnode.mainnet.sui.io",
    },
    "testnet": {
        id: "testnet",
        rpcUrl: "https://fullnode.testnet.sui.io",
    },
} as const;

export type SuiNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in SuiNetworkID]: SuiNetwork };
