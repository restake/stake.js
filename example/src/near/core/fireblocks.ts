import { FireblocksSignerProvider } from "@restake/stake.js/core/signer/provider";
import { ed25519Signer } from "@restake/stake.js/core/signer";
import { NEARProtocol, NEARSigner, networks, ntoy } from "@restake/stake.js/core/protocol/near";

import { readFile } from "node:fs/promises";

const apiKey = await readFile("./keys/fireblocks-api-key.txt", { encoding: "utf-8" }).then((v) => v.trim());
const apiSecret = await readFile("./keys/fireblocks-secret.pem", { encoding: "utf-8" });
// https://console.fireblocks.io/v2/accounts/vault/${number}
const accountId = await readFile("./keys/fireblocks-account.txt", { encoding: "utf-8" }).then((v) => v.trim());

const signerProvider = new FireblocksSignerProvider(apiKey, apiSecret);
const signer: ed25519Signer = await signerProvider.getSigner(accountId, {
    assetId: "NEAR",
    expectedAlgorithm: "MPC_EDDSA_ED25519",
});

const nearNetwork = networks.mainnet;
const nearSigner = new NEARSigner(signer, null, nearNetwork);

const txHash = await NEARProtocol.INSTANCE.createStakeTransaction(nearSigner, "restake.poolv1.near", ntoy(1), "all")
    .then((tx) => nearSigner.signTransaction(tx))
    .then((stx) => NEARProtocol.INSTANCE.broadcast(stx));

console.log(`https://explorer.${nearNetwork.id}.near.org/transactions/${txHash}`);
