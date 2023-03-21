//import { transfer } from "@restake/staking-sdk/core/protocol/ethereum";
import { secp256k1PrivateKey, secp256k1Signer } from "@restake/staking-sdk/core/signer";
import { FilesystemSignerProvider, FireblocksSignerProvider } from "@restake/staking-sdk/core/signer/provider";
import { EthereumProtocol, EthereumSigner, networks } from "@restake/staking-sdk/core/protocol/ethereum";
import { EthereumBroadcastResponse } from "@restake/staking-sdk/core/protocol/ethereum";

const receiveAddress = "0x80E44E1562e2Df92bB6ae08f7c1c5721Ce8d3B24"
const amount = 5000000000000000000n


const provider = new FilesystemSignerProvider<secp256k1Signer>("/Users/hansoskaraaviksoo/.ethereum-credentials/testnet", (identifier, bytes) => {
    const privateKey = new secp256k1PrivateKey(bytes);
    return new secp256k1Signer(privateKey);
});

const signer = await provider.getSigner("ethereumGanache");
const ethereumSigner = new EthereumSigner(signer, networks["ganache"]);
const protocol = EthereumProtocol.INSTANCE;

const txId = await protocol.transfer(ethereumSigner, receiveAddress, amount).then( async (rawTx) => {
    const signedTx = await ethereumSigner.signTransaction(rawTx);
    return await protocol.broadcast(signedTx);
});

console.log(txId);
