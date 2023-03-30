import { NEARProtocol, NEARSigner, networks, ntoy } from "@restake/staking-sdk/core/protocol/near";
import { ed25519PrivateKey, ed25519Signer } from "@restake/staking-sdk/core/signer";
import { FilesystemSignerProvider, FireblocksSignerProvider } from "@restake/staking-sdk/core/signer/provider";

import { Codec, JSONHexEncodedKeyCodec } from "@restake/staking-sdk/core/signer/provider/codec";
import bs58 from "bs58";

const nearCodec: Codec = {
    ...JSONHexEncodedKeyCodec,
    async loadPrivateKey(_identifier: string, buffer: Uint8Array): Promise<Uint8Array> {
        const bytes = new TextDecoder().decode(buffer);

        const parsed = JSON.parse(bytes) as { private_key: string };
        const [ keyType, privateKeyEncoded ] = parsed.private_key.split(":", 2);
        if (keyType !== "ed25519") {
            throw new Error("Unsupported key type " + keyType);
        }

        const decoded = bs58.decode(privateKeyEncoded);
        return decoded.slice(32);
    },
};

const provider = new FilesystemSignerProvider<ed25519Signer>("/Users/mark/.near-credentials/testnet", (identifier, bytes) => {
    const privateKey = new ed25519PrivateKey(bytes);
    return new ed25519Signer(privateKey);
}, nearCodec);

//const provider = new FireblocksSignerProvider(apiKey, apiSecret, vaultId);

const accountId = "testing2.testnet";
const stakingPoolAccount = "restake.near";

const testnetSigner = await provider.getSigner(accountId);

const nearSigner = new NEARSigner(testnetSigner, accountId, networks["testnet"]);
const protocol = NEARProtocol.INSTANCE;

const txid = await protocol.createStakeTransaction(nearSigner, stakingPoolAccount, ntoy(10n)).then(async (rawTxn) => {
    const stxn = await nearSigner.signTransaction(rawTxn);
    return await protocol.broadcastSimple(stxn);
});

console.log("txid", txid);


//  ===================================================
//const copperWalelt = CopperWallet(apiKey, apiSecret) ->>> copperWallet.sign(rawTx) -->> copperWallet.stake('near', 1000)
//rstk.near.buildStakeTransaction(copperWallet)
//const rawTx = rstk.near.buildStakeTransaction(fireblocksWallet, 'restake.poolv1.near', 1000)

interface Wallet {

}

class FilesystemWallet {
    constructor(path: string) {

    }
}

class StakingWhatever {
    stake(wallet: Wallet, amount: BigInt, identifier: string, validatorid: string = "restake") {
        throw new Error();
    }
}

class StakingService {
    get near(): StakingWhatever {
        throw new Error();
    }

    get avalanche(): StakingWhatever {
        throw new Error();
    }

    get ethereum(): StakingWhatever {
        throw new Error();
    }
}

const fireblocksWallet = new FilesystemWallet("~/keys/mikroskeem.json") //FireblocksWallet(apiKey, apiSecret, vaultId)
const rstk = new StakingService();
const txId = rstk.near.stake(fireblocksWallet, 1000n, "restake.poolv1.near")

"https://validator.restake.net/api/v1/${vid}" // ->
