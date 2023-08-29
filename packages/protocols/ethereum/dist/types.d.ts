import { ETHEREUM_NETWORKS } from './constants.js';
import { z } from 'zod';
import { Transaction, TransactionLike } from 'ethers';
import { Network, Ethereum, NetworkConfig, RawTransaction, SignedTransaction, Signature } from '@restake/stakejs-core';

declare const EthereumDepositData: z.ZodObject<{
    pubkey: z.ZodString;
    withdrawal_credentials: z.ZodString;
    amount: z.ZodBigInt;
    signature: z.ZodString;
    deposit_message_root: z.ZodString;
    deposit_data_root: z.ZodString;
    fork_version: z.ZodString;
    network_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pubkey: string;
    withdrawal_credentials: string;
    amount: bigint;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
}, {
    pubkey: string;
    withdrawal_credentials: string;
    amount: bigint;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
}>;
type EthereumDepositData = z.infer<typeof EthereumDepositData>;
type EthereumNetwork = Network<Ethereum> & {
    name: typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS];
};
type EthereumNetworkConfig = NetworkConfig<Ethereum> & {
    network: EthereumNetwork;
};
declare class EthereumRawTransaction implements RawTransaction<Ethereum> {
    protocol: Ethereum;
    transaction: Transaction;
    constructor(tx?: string | TransactionLike<string> | undefined);
    serialize(): string;
    getBytes(): Uint8Array;
    getHash(): string;
    getHashBytes(): Uint8Array;
}
declare class EthereumSignedTransaction implements SignedTransaction<Ethereum> {
    protocol: Ethereum;
    transaction: Transaction;
    constructor(tx: Transaction, signature: Signature);
}

export { EthereumDepositData, EthereumNetwork, EthereumNetworkConfig, EthereumRawTransaction, EthereumSignedTransaction };
