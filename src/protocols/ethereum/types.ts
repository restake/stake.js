import { Transaction } from "ethers";
import { ETHEREUM_NETWORKS } from "./constants.ts";
import { Signature } from "ethers";

export type EthereumNetwork = typeof ETHEREUM_NETWORKS[keyof typeof ETHEREUM_NETWORKS];
export type EthereumRawTransaction = Omit<Transaction, "signature">;
export type EthereumSignedTransaction =  Omit<Transaction, "signature"> & { signature: Signature };

import { z } from "zod";

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
