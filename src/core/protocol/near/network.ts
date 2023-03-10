export interface NEARNetwork {
    id: string;
    rpcUrl: string;
}

export const networks: { [id: string]: NEARNetwork } = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://rpc.mainnet.near.org",
    },
    "testnet": {
        id: "testnet",
        rpcUrl: "https://rpc.testnet.near.org",
    },
};

export type BlockFinality = "optimistic" | "final";

export function isFinality(block: BlockFinality | string): block is BlockFinality {
    return block === "final" || block === "optimistic";
}
