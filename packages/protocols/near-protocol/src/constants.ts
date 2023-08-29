export const NEAR_PROTOCOL_NETWORKS = {
    MAINNET: "mainnet",
    TESTNET: "testnet",
} as const;

export const NEAR_PROTOCOL_DEFAULT_RPC_URLS = {
    [NEAR_PROTOCOL_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/near"),
    [NEAR_PROTOCOL_NETWORKS.TESTNET]: new URL("https://rpc.testnet.near.org"),
} as const;
