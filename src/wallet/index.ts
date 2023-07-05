import { StakeParameters } from "./stake.ts";

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

    keyType(protocol: string): Promise<string>;
}

export interface StakeWallet<P> extends Wallet {
    stake(protocol: string, data: StakeParameters<P>): Promise<string>;
}

export function isSignerWallet(wallet: Wallet): wallet is SignerWallet {
    return "sign" in wallet && "publicKey" in wallet;
}

export function isStakeWallet<P>(wallet: Wallet): wallet is StakeWallet<P> {
    return "stake" in wallet;
}
