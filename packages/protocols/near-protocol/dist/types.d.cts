import { Network, NearProtocol, NetworkConfig, RawTransaction, SignedTransaction, Signature } from '@restake/stakejs-core';
import { NEAR_PROTOCOL_NETWORKS } from './constants.cjs';
import * as nearApi from 'near-api-js';

type NearProtocolNetwork = Network<NearProtocol> & {
    name: typeof NEAR_PROTOCOL_NETWORKS[keyof typeof NEAR_PROTOCOL_NETWORKS];
};
type NearProtocolNetworkConfig = NetworkConfig<NearProtocol> & {
    network: NearProtocolNetwork;
};
declare class NearProtocolRawTransaction implements RawTransaction<NearProtocol> {
    protocol: NearProtocol;
    transaction: nearApi.transactions.Transaction;
    constructor(tx: nearApi.transactions.Transaction);
    serialize(): string;
    getBytes(): Uint8Array;
    getHash(): string;
    getHashBytes(): Uint8Array;
}
declare class NearProtocolSignedTransaction implements SignedTransaction<NearProtocol> {
    protocol: NearProtocol;
    transaction: nearApi.transactions.SignedTransaction;
    constructor(rawTx: nearApi.transactions.Transaction, signature: Signature);
}

export { NearProtocolNetwork, NearProtocolNetworkConfig, NearProtocolRawTransaction, NearProtocolSignedTransaction };
