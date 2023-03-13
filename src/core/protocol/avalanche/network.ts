export interface AvalancheNetwork {
    id: string;
    rpcUrl: string;
    networkId: number;
}

export const networks: { [id: string]: AvalancheNetwork } = {
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
};
