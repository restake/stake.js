import { PROTOCOL } from "./constants";
import { EthereumRawTransaction, EthereumSignedTransaction, EthereumNetwork } from "./ethereum/types";
import { NearProtocolRawTransaction, NearProtocolSignedTransaction, NearProtocolNetwork } from "./near-protocol/types";

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
