import { Protocol } from '../types/global';
import { Wallet } from '../wallets/wallet';

export abstract class ProtocolSDK {
    protocol: Protocol;
    wallet: Wallet;

    constructor(protocol: Protocol, wallet: Wallet) {
        this.protocol = protocol;
        this.wallet = wallet;
    }
}
