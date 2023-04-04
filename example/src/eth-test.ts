import { secp256k1PrivateKey, secp256k1Signer } from "@restake/staking-sdk/core/signer";
import { FilesystemSignerProvider, FireblocksSignerProvider } from "@restake/staking-sdk/core/signer/provider";
import { EthereumProtocol, EthereumSigner, networks } from "@restake/staking-sdk/core/protocol/ethereum";
import { formatUnits, parseUnits } from "ethers";
import fs from "fs";

// Staking
const file = fs.readFileSync("./keys/eth-deposit-data.json", "utf-8");
const { pubkey, withdrawal_credentials, amount, signature, deposit_data_root } = JSON.parse(file)[0];
const weiStakeAmount = parseUnits(formatUnits(amount, "gwei"), "ether");

//Transfer
const receiveAddress = "0x845fEFB215f669f32Ebfdf4Fefb9a62864d732cb";
const transferAmount = 10000000000000000n;

const provider = new FilesystemSignerProvider<secp256k1Signer, "secp256k1">("/Users/hansoskaraaviksoo/.ethereum-credentials/testnet", (identifier, bytes) => {
    return new secp256k1PrivateKey(bytes);
});

const signer = await provider.getSigner("ethereumGanache");
const ethereumSigner = new EthereumSigner(signer, networks["ganache"]);
const protocol = EthereumProtocol.INSTANCE;


const txId = await protocol.stake(ethereumSigner, pubkey, weiStakeAmount, withdrawal_credentials, signature, `0x${deposit_data_root}`).then( async (rawTx) => {
    const signedTx = await ethereumSigner.signTransaction(rawTx);
    return await protocol.broadcast(signedTx);
});

/*
const txId = await protocol.transfer(ethereumSigner, receiveAddress, transferAmount).then( async (rawTx) => {
    const signedTx = await ethereumSigner.signTransaction(rawTx);
    return await protocol.broadcast(signedTx);
});
*/

console.log(txId);
