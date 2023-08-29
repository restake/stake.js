// src/types.ts
import { z } from "zod";
import { Transaction, getBytes } from "ethers";
import { PROTOCOL } from "@restake/stakejs-core";
var EthereumDepositData = z.object({
  pubkey: z.coerce.string(),
  withdrawal_credentials: z.coerce.string(),
  amount: z.coerce.bigint(),
  signature: z.coerce.string(),
  deposit_message_root: z.coerce.string(),
  deposit_data_root: z.coerce.string(),
  fork_version: z.coerce.string(),
  network_name: z.coerce.string()
});
var EthereumRawTransaction = class {
  protocol = PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx) {
    this.transaction = Transaction.from(tx);
  }
  serialize() {
    return this.transaction.unsignedSerialized;
  }
  getBytes() {
    return getBytes(this.transaction.unsignedSerialized);
  }
  getHash() {
    return this.transaction.unsignedHash;
  }
  getHashBytes() {
    return getBytes(this.transaction.unsignedHash);
  }
};
var EthereumSignedTransaction = class {
  protocol = PROTOCOL.ETHEREUM;
  transaction;
  constructor(tx, signature) {
    this.transaction = Transaction.from({
      ...tx.toJSON(),
      signature: {
        v: signature.v,
        r: "0x" + signature.r,
        s: "0x" + signature.s
      }
    });
  }
};
export {
  EthereumDepositData,
  EthereumRawTransaction,
  EthereumSignedTransaction
};
//# sourceMappingURL=types.js.map