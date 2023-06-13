export function vToRecovery(v: number, chainId: number = 1): number {
    // Reverse of (recovery + 35n + BigInt(chainId) * 2n)
    return Number(BigInt(v) - 35n - (BigInt(chainId) / 2n));
}
