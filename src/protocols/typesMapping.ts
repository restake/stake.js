import { PROTOCOL } from "./constants.ts";
import { EthereumRawTransaction, EthereumSignedTransaction, EthereumNetwork } from "./ethereum/types.ts";
import { NearProtocolRawTransaction, NearProtocolSignedTransaction, NearProtocolNetwork } from "./near-protocol/types.ts";

export type ProtocolTypeMapping = {
    [PROTOCOL.ETHEREUM]: {
        rawTransaction: EthereumRawTransaction,
        signedTransaction: EthereumSignedTransaction,
        network: EthereumNetwork,
    },
    [PROTOCOL.NEAR_PROTOCOL]: {
        rawTransaction: NearProtocolRawTransaction,
        signedTransaction: NearProtocolSignedTransaction,
        network: NearProtocolNetwork,
    },
};
