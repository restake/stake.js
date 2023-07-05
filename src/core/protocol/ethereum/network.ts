export interface EthereumNetwork {
    id: string;
    rpcUrl: string;
    chainId: number;
    stakeDepositContractAddress?: string;
}

const _networks = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://rpc.ankr.com/eth",
        chainId: 1,
        // https://etherscan.io/address/0x00000000219ab540356cbb839cbe05303d7705fa
        stakeDepositContractAddress: "0x00000000219ab540356cBB839Cbe05303d7705Fa",
    },
    "testnet": {
        id: "goerli",
        rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        chainId: 5,
    },
    "ganache": {
        id: "ganache",
        rpcUrl: "http://127.0.0.1:7545",
        chainId: 1337,
    },
} as const;

export type EthereumNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in EthereumNetworkID]: EthereumNetwork };

export type BlockFinality = "latest" | "earliest" | "pending";

export function isFinality(block: BlockFinality | string): block is BlockFinality {
    return block === "latest" || block === "earliest" || block === "pending";
}
