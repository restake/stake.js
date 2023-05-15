export interface SuiNetwork {
    id: string;
    rpcUrl: string;
}

const _networks = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "",
    },
    "testnet": {
        id: "testnet",
        rpcUrl: "",
    },
} as const;

export type SuiNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in SuiNetworkID]: SuiNetwork };
