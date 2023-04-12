import { StakeParameters } from "./stake.js";

/**
 * Wallet contains a single keypair
 */
export const __USING_CORE_SDK = Symbol();
export interface Wallet {
    [__USING_CORE_SDK]: boolean;
}

export interface SignerWallet extends Wallet {
    sign(protocol: string, data: Uint8Array): Promise<Uint8Array>;

    accountId(protocol: string): Promise<string | null>;

    publicKey(protocol: string): Promise<Uint8Array>;
}

export interface StakeWallet<P> extends Wallet {
    stake(protocol: string, data: StakeParameters<P>): Promise<string>;
}
