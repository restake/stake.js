import { FireblocksSignerProvider } from "@restake/stake.js/core/signer/provider";
import { secp256k1Signer } from "@restake/stake.js/core/signer";
import { EthereumProtocol, EthereumSigner, networks } from "@restake/stake.js/core/protocol/ethereum";

import { readFile } from "node:fs/promises";

const apiKey = await readFile("./keys/fireblocks-api-key.txt", { encoding: "utf-8" }).then((v) => v.trim());
const apiSecret = await readFile("./keys/fireblocks-secret.pem", { encoding: "utf-8" });
// https://console.fireblocks.io/v2/accounts/vault/${number}
const accountId = await readFile("./keys/fireblocks-account.txt", { encoding: "utf-8" }).then((v) => v.trim());

const signerProvider = new FireblocksSignerProvider(apiKey, apiSecret);
const signer: secp256k1Signer = await signerProvider.getSigner(accountId, {
    assetId: "ETH",
    expectedAlgorithm: "MPC_EDDSA_ED25519",
});

const ethereumNetwork = networks.mainnet;
const ethereumSigner = new EthereumSigner(signer, ethereumNetwork);

// Process deposit data
type EthDepositData = {
    pubkey: string;
    withdrawal_credentials: string;
    amount: string;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
    network_name: string;
};

const depositData = await readFile("./keys/eth-deposit-data.json", { encoding: "utf-8" })
    .then((data) => JSON.parse(data) as EthDepositData[]);

for (const data of depositData) {
    if (data.network_name !== ethereumNetwork.id) {
        console.warn(
            "Deposit data with signature '%s' does not use expected network (expected=%s, got=%s), trying anyway",
            data.signature,
            ethereumNetwork.id,
            data.network_name,
        );
    }

    const tx = await EthereumProtocol.INSTANCE.createStakeTransaction(
        ethereumSigner,
        data.pubkey,
        BigInt(data.amount),
        data.withdrawal_credentials,
        data.signature,
        data.deposit_data_root,
    );

    const txHash = await ethereumSigner.signTransaction(tx)
        .then((stx) => EthereumProtocol.INSTANCE.broadcast(stx));

    console.log(`https://etherscan.io/tx/${txHash}`);
}
