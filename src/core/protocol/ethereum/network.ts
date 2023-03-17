export interface EthereumNetwork {
    id: string;
    rpcUrl: string;
    chainId: number;
}

export const networks: { [id: string]: EthereumNetwork } = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://rpc.ankr.com/eth",
        chainId: 1,

    },
    "testnet": {
        id: "goerli",
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        chainId: 5,
    },
    "ganache": {
        id: "testnetwork",
        rpcUrl: "HTTP://127.0.0.1:7545",
        chainId: 1337,
    },
};
