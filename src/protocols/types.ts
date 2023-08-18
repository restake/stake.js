import { PROTOCOL } from "./constants";
import { ProtocolTypeMapping } from "./typesMapping";

export type Protocol = keyof ProtocolTypeMapping;

export type Ethereum = typeof PROTOCOL.ETHEREUM;
export type NearProtocol = typeof PROTOCOL.NEAR_PROTOCOL;

export type RawTransaction<P extends Protocol> = ProtocolTypeMapping[P]["rawTransaction"];
export type SignedTransaction<P extends Protocol> = ProtocolTypeMapping[P]["signedTransaction"];
export type Network<P extends Protocol> = ProtocolTypeMapping[P]["network"];
export type NetworkConfig<P extends Protocol> = {
	protocol: P,
	network: Network<P>
}
