import { AvalancheChainID, AvalancheNetwork } from "./network.js";
import { secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { Transaction, SignedTransaction } from "./AvalancheTransaction.js";
import { TransactionSigner } from "../../signer/TransactionSigner.js";
import { jsonrpc } from "../../utils/http.js";

import { Avalanche } from "avalanche";
import { Buffer } from "buffer/index.js";
import { bech32 } from "bech32";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { SelectCredentialClass } from "avalanche/dist/apis/platformvm/credentials.js";
import { Credential, Signature } from "avalanche/dist/common/index.js";
import { Tx } from "avalanche/dist/apis/platformvm/tx.js";
import { hexToBytes } from "@noble/curves/abstract/utils";

export class AvalancheSigner implements TransactionSigner<Transaction, SignedTransaction>  {
    #parent: secp256k1Signer;
    #network: AvalancheNetwork;
    #avalanche: Avalanche;

    constructor(parent: secp256k1Signer, network: AvalancheNetwork) {
        this.#parent = parent;
        this.#network = network;
        this.#avalanche = AvalancheSigner.getClient(network.rpcUrl, network.id, network.networkId);
    }

    deriveAddress(chainID: AvalancheChainID): string {
        const publicKey = this.#parent.publicKey;
        const networkID = this.#network.id;

        // The 33-byte compressed representation of the public key is hashed with sha256 once.
        // The result is then hashed with ripemd160 to yield a 20-byte address.
        const hash = ripemd160(sha256(publicKey.bytes));
        const words = bech32.toWords(hash);
        return `${chainID}-${bech32.encode(networkID, words)}`;
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        const message = sha256(transaction.payload.toBuffer());

        // Rough port from Avalanche SDK
        const ins = transaction.payload.getTransaction().getIns();
        const creds: Credential[] = [];
        for (let i = 0; i < ins.length; i++) {
            const cred: Credential = SelectCredentialClass(ins[`${i}`].getInput().getCredentialID());
            const sigidxs = ins[`${i}`].getInput().getSigIdxs();

            for (let j: number = 0; j < sigidxs.length; j++) {
                //const keypair: KeyPair = kc.getKey(sigidxs[`${j}`].getSource());
                //const signval: Buffer = keypair.sign(Buffer.from(message));

                // TODO: multiple key support?
                const { r, s, recovery } = await this.#parent.edSign(message);

                // Signature length is 65 bytes
                const signval = Buffer.from(hexToBytes([
                    r.toString(16).padStart(64, "0"),
                    s.toString(16).padStart(64, "0"),
                    (recovery ?? 0).toString(16).padStart(2, "0"),
                ].join("")));

                const sig: Signature = new Signature();
                sig.fromBuffer(signval)
                cred.addSignature(sig)
            }
            creds.push(cred);
        }

        const signedTx = new Tx(transaction.payload, creds);

        return {
            transaction,
            payload: signedTx
        };
    }

    async fetchStakingAssetID(): Promise<{ assetID: string }> {
        const endpoint = new URL("/ext/bc/P", this.network.rpcUrl);
        return await jsonrpc<{ assetID: string }>(endpoint, "platform.getStakingAssetID", {});
    }

    async fetchMinStake(): Promise<{minValidatorStake: string, minDelegatorStake: string}> {
        const endpoint = new URL("/ext/bc/P", this.network.rpcUrl);
        return await jsonrpc<{minValidatorStake: string, minDelegatorStake: string}>(endpoint, "platform.getMinStake", {});
    }

    get client(): Avalanche {
        return this.#avalanche;
    }

    get network(): AvalancheNetwork {
        return this.#network;
    }

    private static getClient(rpcUrl: string, network: string, networkId: number): Avalanche {
        const url = new URL(rpcUrl);
        const client = new Avalanche(
            url.hostname,
            parseInt(url.port),
            url.protocol.replace(':', ''),
            networkId,
            undefined,
            undefined,
            network,
        );

        return client;
    }

}
