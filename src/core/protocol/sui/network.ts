export interface SuiNetwork {
    id: string;
    rpcUrl: string;
    wsUrl?: string;
    faucetUrl?: string;
}

function createNetwork(id: string): SuiNetwork {
    return {
        id,
        rpcUrl: `https://fullnode.${id}.sui.io`,
        faucetUrl: id === "mainnet" ? undefined : `https://faucet.${id}.sui.io/gas`,
    };
}

const _networks = {
    "mainnet": createNetwork("mainnet"),
    "testnet": createNetwork("testnet"),
    "devnet": createNetwork("devnet"),
} as const;

export type SuiNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in SuiNetworkID]: SuiNetwork };
