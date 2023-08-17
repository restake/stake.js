import { NEARProtocol, NEARSigner, networks } from "@restake/stake.js/core/protocol/near";
import {  FireblocksSignerProvider } from "@restake/stake.js/core/signer/provider";
import { readFile } from "node:fs/promises";

const { key: apiKey, secret: apiSecret } = await readFile("./keys/fireblocks.json", { encoding: "utf-8" }).then((str) => {
    return JSON.parse(str);
});
const vaultId = "8"; // Vault with name "Staking Development"

const provider = new FireblocksSignerProvider(apiKey, apiSecret);

const stakingPoolAccount = "restake.poolv1.near";

const mainnetSigner = await provider.getSigner(vaultId, { assetId: "NEAR", expectedAlgorithm: "MPC_EDDSA_ED25519" });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const nearSigner = new NEARSigner(mainnetSigner, null, networks["mainnet"]);
const protocol = NEARProtocol.INSTANCE;

const txid = await protocol.createStakeTransaction(nearSigner, stakingPoolAccount, 100000000000000000000000n).then(async (rawTxn) => {
    const stxn = await nearSigner.signTransaction(rawTxn);

    return await protocol.broadcastSimple(stxn);
});

console.log("txid", txid);
