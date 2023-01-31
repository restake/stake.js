import { Tx, UnsignedTx } from "avalanche/dist/apis/platformvm";
import { NearProtocolSDK } from "../protocols/near-protocol-sdk";
import { Network, Protocol } from "../types/global";


export abstract class Wallet {

    network: Network;
    near: NearProtocolSDK;

    constructor(network: Network) {
        this.network = network;
        this.near = new NearProtocolSDK(this);
    }

    abstract getAddress(protocol: Protocol, keypairId?: string): string | Promise<string>;
    abstract signTxHash(protocol: Protocol, txHash: Uint8Array, keypairId?: string): Uint8Array | Promise<Uint8Array>;
    abstract signAvaTx(protocol: Protocol, rawTx: UnsignedTx, keypairId?: string): Tx | Promise<Tx>;
}
