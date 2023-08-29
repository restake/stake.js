import { PROTOCOL } from "./constants.ts";

export type Protocol = typeof PROTOCOL[keyof typeof PROTOCOL];

export type Network<P extends Protocol> = {
    _protocol?: P;
    name: string;
}

export type NetworkConfig<P extends Protocol> = {
    protocol: P;
    network: Network<P>;
};

export type Ethereum = typeof PROTOCOL.ETHEREUM;
export type NearProtocol = typeof PROTOCOL.NEAR_PROTOCOL;
export type Avalanche = typeof PROTOCOL.AVALANCHE;
export type Sui = typeof PROTOCOL.SUI;
export type Polygon = typeof PROTOCOL.POLYGON;
export type CosmosHub = typeof PROTOCOL.COSMOS_HUB;
export type Tezos = typeof PROTOCOL.TEZOS;
export type Solana = typeof PROTOCOL.SOLANA;
export type MultiversX = typeof PROTOCOL.MULTIVERSX;
export type Polkadot = typeof PROTOCOL.POLKADOT;
