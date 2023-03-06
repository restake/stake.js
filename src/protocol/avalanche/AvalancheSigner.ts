import { secp256k1KeyPair, secp256k1PrivateKey, secp256k1PublicKey, secp256k1Signer } from "../../signer/secp256k1Signer.js";
import { bech32 } from "bech32";
import type { Signer } from "../../signer/signer.js";
import { AvalancheNetwork } from "./network.js";
import { Avalanche } from "avalanche";
import { encode as b64encode } from "../../utils/base64.js";

const AVALANCHE_NETWORK_ID = 5;

export class AvalancheSigner implements Signer<Uint8Array, Uint8Array> {
    #parent: secp256k1Signer;
    #network: AvalancheNetwork;
    #avalanche: Avalanche;

    // Flag to update nonce
    #dirtyState: boolean = false;

    constructor(parent: secp256k1Signer, network: AvalancheNetwork) {

        this.#parent = parent;
        this.#network = network;
        this.#avalanche = AvalancheSigner.getClient(network.id, network.rpcUrl);

    }

    async deriveAddress(chainID: string): Promise<string> {
        const publicKey = await this.#parent.getPublicKey();
        const networkID = this.#network.id;
        return `${chainID}-${bech32.encode(networkID, publicKey.getBytes())}`;
    }

    async sign(payload: Uint8Array): Promise<Uint8Array> {

        return this.#parent.sign(payload);
    }

    verify(payload: Uint8Array, signature: Uint8Array): Promise<boolean> {

        return this.#parent.verify(payload, signature);

    }

    get client(): Avalanche {

        return this.#avalanche

    }

    private static getClient(rpcUrl: string, network: string): Avalanche {
        const url = new URL(rpcUrl);

        const client = new Avalanche(
          url.hostname,
          parseInt(url.port),
          url.protocol.replace(':', ''),
          AVALANCHE_NETWORK_ID,
          undefined,
          undefined,
          network,
        );

        // @ts-ignore
        client.setRequestConfig("validateStatus", (status) => {
            return true;
        });

        return client;
    }

}
