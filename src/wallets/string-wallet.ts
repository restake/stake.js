import { KeyPair } from "near-api-js";
import { Wallet } from "./wallet";

export class StringWallet extends Wallet {
    signTxHash(txHash:  Uint8Array, protocol: string, vault: string): Uint8Array {
        const privateKey: string | undefined = process.env[vault];
        let signature: Uint8Array;

        if (!privateKey) {
            throw new Error(`Cannot read private key for protocol ${protocol} in environment variables.`);
        }

        switch (protocol) {
            case 'near': 
                const keyPair: KeyPair = KeyPair.fromString(privateKey);
                signature =  keyPair.sign(txHash).signature;
                break;
            default: 
                throw new Error(`Protocol ${protocol} not supported.`)
        }
        
        return signature;
    }
}