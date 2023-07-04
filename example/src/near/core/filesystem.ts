import { FilesystemSignerProvider } from "@restake/stake.js/core/signer/provider";
import { ed25519PrivateKey, ed25519Signer } from "@restake/stake.js/core/signer";
import { NEARProtocol, NEARSigner, networks, ntoy } from "@restake/stake.js/core/protocol/near";

const signerProvider = new FilesystemSignerProvider<ed25519Signer, "ed25519">("./keys", (_identifier, bytes) => {
    return new ed25519PrivateKey(bytes);
});

const accountId = "testing.near";
const signer: ed25519Signer = await signerProvider.getSigner(accountId, undefined);

const nearNetwork = networks.mainnet;
const nearSigner = new NEARSigner(signer, accountId, nearNetwork);

const txHash = await NEARProtocol.INSTANCE.createStakeTransaction(nearSigner, "restake.poolv1.near", ntoy(1), "all")
    .then((tx) => nearSigner.signTransaction(tx))
    .then((stx) => NEARProtocol.INSTANCE.broadcast(stx));

console.log(`https://explorer.${nearNetwork.id}.near.org/transactions/${txHash}`);
