import { Network, Protocol } from "../types/global";
import { Wallet } from "./wallet";

import { KeyPair } from "near-api-js";
import { FileSystemKeyPair, FileSystemProvider } from "../providers/filesystem-provider";

export class FileSystemWallet extends Wallet {

    fileSystemProvider: FileSystemProvider;

    constructor(network: Network, filePath: string) {
        super(network);
        this.fileSystemProvider = new FileSystemProvider(filePath);
    }

    getKeyPair(protocol: Protocol, keyPairId?: string): FileSystemKeyPair {
        let keyPair: FileSystemKeyPair | undefined;

        if (keyPairId) {
            keyPair = this.fileSystemProvider.wallet.find(kp => (kp.id == keyPairId));
            if (!keyPair) {
                throw new Error(`KeyPair with id ${keyPairId} not found.`);
            }

            if (keyPair.protocol != protocol) {
                throw new Error(`Keypair with id ${keyPairId} is configured for ${keyPair.protocol}, not ${protocol}`);
            }

            if (keyPair.network != this.network) {
                throw new Error(`Keypair with id ${keyPairId} id configured for ${keyPair.network}, not ${this.network}`)
            }
        } else {
            keyPair = this.fileSystemProvider.wallet.find(kp => (kp.protocol == protocol) && (kp.network == this.network));

            if (!keyPair) {
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
                const keyPair: KeyPair = KeyPair.fromString(privateKey);
                signature =  keyPair.sign(txHash).signature;
                break;
            default: 
                throw new Error(`Protocol ${protocol} not supported.`)
        }
        
        return signature;
    }
}
