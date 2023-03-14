import { AvalancheProtocol, AvalancheSigner, networks } from "@restake/staking-sdk/core/protocol/avalanche";
import { secp256k1PrivateKey, secp256k1Signer } from "@restake/staking-sdk/core/signer";
import { FilesystemSignerProvider, FireblocksSignerProvider } from "@restake/staking-sdk/core/signer/provider";


const provider = new FilesystemSignerProvider<secp256k1Signer>("/Users/hansoskaraaviksoo/.avalanche-credentials/testnet", (identifier, bytes) => {
    const privateKey = new secp256k1PrivateKey(bytes);
    return new secp256k1Signer(privateKey);
});

const testnetSigner = await provider.getSigner("avalancheTesting");
const avalancheSigner = new AvalancheSigner(testnetSigner, networks["testnet"]);
const protocol = AvalancheProtocol.INSTANCE;

const dateStart = new Date(new Date().getTime()+10000)
const dateEnd = new Date(dateStart.getTime()+1209600000);

const txid = await protocol.buildStakeTransaction(avalancheSigner, "", "100000", dateStart, dateEnd).then(async (rawTx) => {
    const stx = await avalancheSigner.signTransaction(rawTx);
    return await protocol.broadcastSimple(stx);
})

console.log("txid: ", txid)
