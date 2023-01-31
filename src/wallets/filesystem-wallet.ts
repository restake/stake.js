import { Network, Protocol } from "../types/global";
import { Wallet } from "./wallet";

import { Avalanche, Buffer, BinTools } from "avalanche";
import { KeyPair as NearKeyPair} from "near-api-js";
import { FileSystemKeyPair, FileSystemProvider } from "../providers/filesystem-provider";
import { MessageChannel } from "worker_threads";
import { Tx, UnsignedTx } from "avalanche/dist/apis/platformvm";
import { cb58EncodedPayload } from "avalanche/dist/utils";

export class FileSystemWallet extends Wallet {

    fileSystemProvider: FileSystemProvider;

    constructor(network: Network, filePath: string) {
        super(network);
        this.fileSystemProvider = new FileSystemProvider(filePath);
    }

    getKeyPair(protocol: Protocol, keyPairId?: string): FileSystemKeyPair {
        let keyPair: FileSystemKeyPair | undefined;

        if (keyPairId != undefined) {
            keyPair = this.fileSystemProvider.wallet.find(kp => (kp.id == keyPairId));
            if (!keyPair) {
                throw new Error(`KeyPair with id ${keyPairId} not found.`);
            }

            if (keyPair.protocol != protocol) {
                throw new Error(`Keypair with id ${keyPairId} is configured for ${keyPair.protocol}, not ${protocol}`);
            }

            if (keyPair.network != this.network) {
                throw new Error(`Keypair with id ${keyPairId} id configured for ${keyPair.network}, not ${this.network}`);
            }
        } else {
            keyPair = this.fileSystemProvider.wallet.find(kp => (kp.protocol == protocol) && (kp.network == this.network));

            if (keyPair === undefined) {
                throw new Error(`KeyPair not found for ${protocol} on ${this.network}.`);
            }
        }

        return keyPair;
    }

    getAddress(protocol: Protocol, keyPairId?: string): string {
        const keyPair: FileSystemKeyPair = this.getKeyPair(protocol, keyPairId);
        return keyPair.address;
    }

    signTxHash(protocol: Protocol, txHash: Uint8Array, keyPairId?: string): Uint8Array {
        const keyPair: FileSystemKeyPair = this.getKeyPair(protocol, keyPairId);
        const b64PrivateKey: string = keyPair.privateKey;
        const privateKey: string = Buffer.from(b64PrivateKey, 'base64').toString('utf8');

        let signature: Uint8Array;

        switch (protocol) {
            case 'near-protocol': 
                const keyPair: NearKeyPair = NearKeyPair.fromString(privateKey);
                signature =  keyPair.sign(txHash).signature;
                break;
            case 'avalanche': 
                const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 5);
                const pChain = avalanche.PChain();
                const pKeyChain = pChain.keyChain();
                const pKeypair = pKeyChain.importKey(privateKey);
                let message = Buffer.from(txHash);
                signature= pKeypair.sign(message);
                break;
            default: 
                throw new Error(`Protocol ${protocol} not supported.`)
        }
        
        return signature;
    }

    signAvaTx(protocol: Protocol, rawTx: UnsignedTx, keyPairId?: string): Tx{
        const binTools = BinTools.getInstance();

        const keyPair: FileSystemKeyPair = this.getKeyPair(protocol, keyPairId);
        const bufPrivatekey: Buffer = Buffer.from(keyPair.privateKey);
        const cb58Privatekey: string = binTools.cb58Encode(bufPrivatekey)
        //const b64PrivateKey: string = keyPair.privateKey;
        //const privateKey: string = Buffer.from(b64PrivateKey, 'base64').toString('utf8');

        let signedTx: Tx;

        const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 5);
        const pChain = avalanche.PChain();
        const pKeyChain = pChain.keyChain();
        const pKeypair = pKeyChain.importKey(cb58Privatekey);

        return rawTx.sign(pKeyChain)
    }
}
