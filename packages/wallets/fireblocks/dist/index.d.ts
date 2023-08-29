import { SignerWallet, NetworkConfig, Protocol, RawTransaction, Signature } from '@restake/stakejs-core';
import { FireblocksSDK } from 'fireblocks-sdk';

declare class FireblocksWallet implements SignerWallet {
    fb: FireblocksSDK;
    vaultId: string;
    constructor(apiKey: string, apiSecret: string, vaultId: string);
    getFbNetworkId(networkConfig: NetworkConfig<Protocol>): string;
    getAddress(networkConfig: NetworkConfig<Protocol>, selector?: string): Promise<string>;
    getPublicKey(_networkConfig: NetworkConfig<Protocol>, _selector?: string): Promise<string>;
    sign<P extends Protocol>(rawTx: RawTransaction<P>, networkConfig: NetworkConfig<P>, selector?: string): Promise<Signature>;
}

export { FireblocksWallet };
