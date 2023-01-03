import { Network } from './types/global'; 
import { NearProtocol } from './protocols/near-protocol';

export { StringWallet } from './wallets/string-wallet';
export { Fireblocks } from './wallets/fireblocks';

export class StakingService {
    network: Network;
    near: NearProtocol;

    constructor(network: Network) {
        this.network = network;

        this.near = new NearProtocol(network);

    }
}

