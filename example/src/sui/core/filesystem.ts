import { FilesystemSignerProvider } from "@restake/stake.js/core/signer/provider";
import { secp256k1PrivateKey, secp256k1Signer } from "@restake/stake.js/core/signer";
import { SuiProtocol, SuiSigner, networks } from "@restake/stake.js/core/protocol/sui";

const signerProvider = new FilesystemSignerProvider<secp256k1Signer, "secp256k1">("./keys", (_identifier, bytes) => {
    return new secp256k1PrivateKey(bytes);
});

const accountId = "key";
const signer: secp256k1Signer = await signerProvider.getSigner(accountId, undefined);

const suiNetwork = networks.mainnet;
const suiSigner = new SuiSigner(signer, suiNetwork);

const validatorAddress = "0xe08d75c562928f58bdbe697e7e35de4802535722337d88305669286e649a104c";
const amount = 1_000_000_000n; // 1 SUI

const txHash = await SuiProtocol.INSTANCE.createAddStakeTransaction(suiSigner, validatorAddress, amount)
    .then((tx) => suiSigner.signTransaction(tx))
    .then((stx) => SuiProtocol.INSTANCE.broadcast(stx));

console.log(`https://suiexplorer.com/txblock/${txHash}`);
