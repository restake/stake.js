export const ETHEREUM_NETWORKS = {
    MAINNET: "mainnet",
    GOERLI: "goerli",
} as const;

export const ETHEREUM_NETWORK_CHAIN_IDS = {
    [ETHEREUM_NETWORKS.MAINNET]: 1,
    [ETHEREUM_NETWORKS.GOERLI]: 5,
} as const;

export const DEFAULT_RPC_URLS = {
    [ETHEREUM_NETWORKS.MAINNET]: new URL("https://rpc.ankr.com/eth"),
    [ETHEREUM_NETWORKS.GOERLI]: new URL("https://rpc.ankr.com/eth_goerli"),
} as const;

export const DEPOSIT_CONTRACT_ADDRESS = {
    [ETHEREUM_NETWORKS.MAINNET]: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    [ETHEREUM_NETWORKS.GOERLI]: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
} as const;

export const DEPOSIT_CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "pubkey",
                "type": "bytes",
            },
            {
                "internalType": "bytes",
                "name": "withdrawal_credentials",
                "type": "bytes",
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes",
            },
            {
                "internalType": "bytes32",
                "name": "data_root_value",
                "type": "bytes32",
            },
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
] as const;
