// TODO
export type SignedTransaction = unknown;

export interface TransactionBroadcaster<S = SignedTransaction, R = unknown> {
    broadcast(signedTransaction: S): Promise<R>;
    broadcastSimple(signedTransaction: S): Promise<string>;
}