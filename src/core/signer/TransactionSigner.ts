export interface TransactionSigner<T = unknown, S = unknown> {
    signTransaction(transaction: T): Promise<S>;
}
