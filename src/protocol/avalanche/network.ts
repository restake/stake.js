export interface AvalancheNetwork {
    id: string;
    rpcUrl: string;
}

export const networks: { [id: string]: AvalancheNetwork } = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://api.avax.network",
    },
    "testnet": {
        id: "fuji",
        rpcUrl: "https://api.avax-test.network",
    },
};
