import { NEARProtocol, NEARSigner, networks, ntoy } from "@restake/staking-sdk/core/protocol/near";
import { ed25519PrivateKey, ed25519Signer } from "@restake/staking-sdk/core/signer";
import { FilesystemSignerProvider, FireblocksSignerProvider } from "@restake/staking-sdk/core/signer/provider";

const provider = new FilesystemSignerProvider<ed25519Signer>("/Users/mark/.near-credentials/testnet", (identifier, bytes) => {
    const privateKey = new ed25519PrivateKey(bytes);
    return new ed25519Signer(privateKey);
});

//const provider = new FireblocksSignerProvider(apiKey, apiSecret, vaultId);

const accountId = "testing.testnet";
const stakingPoolAccount = "restake.near";

const testnetSigner = await provider.getSigner(accountId);

const nearSigner = new NEARSigner(testnetSigner, accountId, networks["testnet"]);
const protocol = NEARProtocol.INSTANCE;

const txid = protocol.createStakeTransaction(nearSigner, stakingPoolAccount, ntoy(10n)).then(async (rawTxn) => {
    const stxn = await nearSigner.sign(rawTxn);
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

const fireblocksWallet = new FilesystemWallet("~/.near-credentials") //FireblocksWallet(apiKey, apiSecret, vaultId)
const rstk = new StakingService();
const txId = rstk.near.stake(fireblocksWallet, 1000n, "mikroskeem.testnet", "restake")

"https://validator.restake.net/api/v1/${vid}" // ->
