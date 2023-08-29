import { PROTOCOL } from './constants.js';

type Protocol = typeof PROTOCOL[keyof typeof PROTOCOL];
type Network<P extends Protocol> = {
    _protocol?: P;
    name: string;
};
type NetworkConfig<P extends Protocol> = {
    protocol: P;
    network: Network<P>;
};
type Ethereum = typeof PROTOCOL.ETHEREUM;
type NearProtocol = typeof PROTOCOL.NEAR_PROTOCOL;
type Avalanche = typeof PROTOCOL.AVALANCHE;
type Sui = typeof PROTOCOL.SUI;
type Polygon = typeof PROTOCOL.POLYGON;
type CosmosHub = typeof PROTOCOL.COSMOS_HUB;
type Tezos = typeof PROTOCOL.TEZOS;
type Solana = typeof PROTOCOL.SOLANA;
type MultiversX = typeof PROTOCOL.MULTIVERSX;
type Polkadot = typeof PROTOCOL.POLKADOT;

export { Avalanche, CosmosHub, Ethereum, MultiversX, NearProtocol, Network, NetworkConfig, Polkadot, Polygon, Protocol, Solana, Sui, Tezos };
