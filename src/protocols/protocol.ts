import { Network, Protocol } from '../types/global';
import { Wallet } from '../wallets/wallet';

export abstract class ProtocolSDK {
    protocol: Protocol;
    network: Network;

    constructor(protocol: Protocol, network: Network) {
        this.protocol = protocol;
        this.network = network;
    }

    abstract signTransaction(wallet: Wallet, vaultId: string, rawTx: any): any;
    abstract broadcastTransaction(signedTx: any): Promise<string>;
}
