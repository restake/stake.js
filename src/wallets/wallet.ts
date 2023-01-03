import { Network, Protocol } from "../types/global";

export interface Vault {};

export abstract class Wallet {
    vaults: Array<Vault>;

    constructor(vaults: Array<Vault>) {
      this.vaults = vaults;
    }
    abstract getAddress(vaultId: string, protocol: Protocol, network: string): string | Promise<string>;
    abstract signTxHash(txHash: Uint8Array, vaultId: string, protocol: Protocol, network: Network): Uint8Array | Promise<Uint8Array>;
}
