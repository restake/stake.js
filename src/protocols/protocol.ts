import { Network } from '../networks';
import { Wallet } from '../wallets/wallet';

export abstract class Protocol {
    network: Network;

    constructor(network: Network) {
        this.network = network;
    }

    abstract signTransaction(rawTx: any, wallet: Wallet, vault: string): any;
    abstract broadcastTransaction(signedTx: any): Promise<string>;
}
