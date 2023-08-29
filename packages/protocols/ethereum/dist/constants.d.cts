declare const ETHEREUM_NETWORKS: {
    readonly MAINNET: "mainnet";
    readonly GOERLI: "goerli";
};
declare const ETHEREUM_NETWORK_CHAIN_IDS: {
    readonly mainnet: 1;
    readonly goerli: 5;
};
declare const ETHEREUM_DEFAULT_RPC_URLS: {
    readonly mainnet: URL;
    readonly goerli: URL;
};
declare const ETHEREUM_DEPOSIT_CONTRACT_ADDRESS: {
    readonly mainnet: "0x00000000219ab540356cBB839Cbe05303d7705Fa";
    readonly goerli: "0x00000000219ab540356cBB839Cbe05303d7705Fa";
};
declare const ETHEREUM_DEPOSIT_CONTRACT_ABI: string;

export { ETHEREUM_DEFAULT_RPC_URLS, ETHEREUM_DEPOSIT_CONTRACT_ABI, ETHEREUM_DEPOSIT_CONTRACT_ADDRESS, ETHEREUM_NETWORKS, ETHEREUM_NETWORK_CHAIN_IDS };
