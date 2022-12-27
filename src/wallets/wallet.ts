export abstract class Wallet {
    abstract signTxHash(txHash:  Uint8Array, protocol: string, vault: string): Uint8Array;
}