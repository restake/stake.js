/**
 * Wallet contains a single keypair
 */
export const __USING_CORE_SDK = Symbol();
export interface Wallet {
    [__USING_CORE_SDK]: boolean;
}
