import { Network, Protocol } from "../types/global";
import { Vault, Wallet } from "./wallet";

import { KeyPair } from "near-api-js";

interface StringVault extends Vault {
    id: string,
    address: string,
    privateKeyVarname: string;
    protocol: Protocol,
    network: Network;
}

export class StringWallet extends Wallet {

    declare vaults: Array<StringVault>;

    constructor(vaults: Array<StringVault>) {
        super(vaults);
    }

    private getVault(vaultId: string): StringVault {
        const vault: StringVault | undefined = this.vaults.find(vault => vault.id = vaultId);
        if (!vault) {
          throw new Error(`Vault with id ${vaultId} not found.`)
        }
        return vault;
    }

    getAddress(vaultId: string, protocol: Protocol, network: string): string {
        const vault: StringVault = this.getVault(vaultId);
        if (vault.protocol != protocol) {
            throw new Error(`Vault with ID ${vaultId} is configured for ${vault.protocol}. It cannot be used for ${protocol}.`);
        }
        if (vault.network != network) {
            throw new Error(`Vault with ID ${vaultId} is configured for ${vault.network}. It cannot be used for ${network}.`);
        }
        return vault.address;
    }

    signTxHash(txHash:  Uint8Array, vaultId: string, protocol: Protocol, network: Network): Uint8Array {
        const vault: StringVault = this.getVault(vaultId);
        if (vault.network != network) {
            throw new Error(`Vault with ID ${vaultId} is configured for ${vault.network}. It cannot be used for ${network}.`);
        }

        const privateKey: string | undefined = process.env[vault.privateKeyVarname];
        
        if (!privateKey) {
            throw new Error(`Cannot read private key for protocol ${protocol} in environment variables.`);
        }

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
