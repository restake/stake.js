/**
 * Wallet contains a single keypair
 */
export const __WALLET_IMPL = Symbol();
export interface Wallet {
    [__WALLET_IMPL]: boolean;
}
