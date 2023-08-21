import { NearProtocolService, LedgerWallet } from "@restake/stake.js";

const near = new NearProtocolService("mainnet");

const wallet = new LedgerWallet();

const derivationPath = "44'/397'/0'/0'/1'";

const rawTx = await near.tx.buildStakeTx(wallet, "restake.poolv1.near", 1, "restake.near", derivationPath);
console.log(rawTx);

const signedTx = await near.tx.sign(wallet, rawTx, derivationPath);
console.log(signedTx);

const txId = await near.tx.broadcast(signedTx);
console.log(txId);
