import { ETHEREUM_NETWORKS } from "./constants.ts";
import { z } from "zod";
import { Transaction, getBytes } from "ethers";
import { Network, NetworkConfig, PROTOCOL, Ethereum, RawTransaction, Signature, SignedTransaction } from "@restake/stake.js-core";
import { TransactionLike } from "ethers";

export const EthereumDepositData = z.object({
    pubkey: z.coerce.string(),
    withdrawal_credentials: z.coerce.string(),
    amount: z.coerce.bigint(),
    signature: z.coerce.string(),
    deposit_message_root: z.coerce.string(),
    deposit_data_root: z.coerce.string(),
    fork_version: z.coerce.string(),
    network_name: z.coerce.string(),
});

export type EthereumDepositData = z.infer<typeof EthereumDepositData>;

export type EthereumNetwork = Network<Ethereum> & { name: typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS] };

export type EthereumNetworkConfig = NetworkConfig<Ethereum> & { network: EthereumNetwork };

export class EthereumRawTransaction implements RawTransaction<Ethereum> {
    protocol: Ethereum = PROTOCOL.ETHEREUM;
    transaction: Transaction;

    constructor(tx?: string | TransactionLike<string> | undefined) {
        this.transaction = Transaction.from(tx);
    }

    serialize(): string {
        return this.transaction.unsignedSerialized;
    }

    getBytes(): Uint8Array {
        return getBytes(this.transaction.unsignedSerialized);
    }

    getHash(): string {
        return this.transaction.unsignedHash;
    }

    getHashBytes(): Uint8Array {
        return getBytes(this.transaction.unsignedHash);
    }

}

export class EthereumSignedTransaction implements SignedTransaction<Ethereum> {
    protocol: Ethereum = PROTOCOL.ETHEREUM;
    transaction: Transaction;

    constructor(tx: Transaction, signature: Signature) {
        this.transaction = Transaction.from({
            ...tx.toJSON(),
            signature: {
                v: signature.v,
                r: "0x" + signature.r,
                s: "0x" + signature.s,
            },
        });
    }
}
