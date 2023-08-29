import EthereumLedgerApp from '@ledgerhq/hw-app-eth';
import { SignerWallet, Protocol, RawTransaction, NetworkConfig, Signature } from '@restake/stakejs-core';

type LedgerApp = typeof EthereumLedgerApp.default;
declare class LedgerNodeWallet implements SignerWallet {
    app?: LedgerApp[keyof LedgerApp];
    private getApp;
    sign<P extends Protocol>(rawTx: RawTransaction<P>, network: NetworkConfig<P>, selector?: string): Promise<Signature>;
    getPublicKey<P extends Protocol>(network: NetworkConfig<P>, selector?: string): Promise<string>;
    getAddress(network: NetworkConfig<Protocol>, selector?: string): Promise<string>;
}

export { LedgerNodeWallet };
