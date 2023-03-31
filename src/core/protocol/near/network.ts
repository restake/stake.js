export interface NEARNetwork {
    id: string;
    rpcUrl: string;
}

const _networks = {
    "mainnet": {
        id: "mainnet",
        rpcUrl: "https://rpc.mainnet.near.org",
    },
    "testnet": {
        id: "testnet",
        rpcUrl: "https://rpc.testnet.near.org",
    },
} as const;

export type NEARNetworkID = keyof typeof _networks;

export const networks = _networks as { [id in NEARNetworkID]: NEARNetwork };

export type BlockFinality = "optimistic" | "final";

export function isFinality(block: BlockFinality | string): block is BlockFinality {
    return block === "final" || block === "optimistic";
}
