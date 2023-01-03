import { Vault, Wallet } from "./wallet";
import { DepositAddressResponse, FireblocksSDK, PeerType, TransactionOperation, TransactionResponse, TransactionStatus } from "fireblocks-sdk";
import { setTimeout } from "timers/promises";
import { Network } from "../types/global";

const PROTOCOL_MAPPING: Map<string, string> = new Map([
    ['near-protocol-mainnet', 'NEAR'],
    ['near-protocol-testnet', 'NEAR_TEST'],
    ['ethereum-testnet', 'ETH_TEST3'],
    ['ethereum-mainnet', 'ETH']
]);

interface FireblocksVault extends Vault {
  id: string,
  fireblocksId: string,
  secretKey: string,
  apiKey: string
}

export class Fireblocks extends Wallet {
    declare vaults: Array<FireblocksVault>;
    fbEngines: Map<string, FireblocksSDK> = new Map();

    constructor(vaults: Array<FireblocksVault>) {
        super(vaults);
        for (let vault of vaults) {
          this.fbEngines.set(vault.id, new FireblocksSDK(vault.secretKey, vault.apiKey));
        }
    }

    private getVault(vaultId: string): FireblocksVault {
        const vault: FireblocksVault | undefined = this.vaults.find(vault => vault.id = vaultId);
        if (!vault || !this.fbEngines.has(vaultId)) {
          throw new Error(`Vault with id ${vaultId} not found.`)
        }
        return vault;
    }

    private getAssetId(protocol: string, network: Network): string {
        const assetId: string | undefined = PROTOCOL_MAPPING.get(`${protocol}-${network}`);
        if (!assetId) {
            throw new Error(`Protocol ${protocol} with network ${network} is not supported by Fireblocks`);
        }
        return assetId;
    }

    async getAddress(vaultId: string, protocol: string, network: Network): Promise<string> {
        const vault: FireblocksVault = this.getVault(vaultId);
        const fb: FireblocksSDK = this.fbEngines.get(vaultId)!;

        const address: DepositAddressResponse[] = await fb.getDepositAddresses(vault.fireblocksId, this.getAssetId(protocol, network));
        return address[0].address;
    }

    async signTxHash(txHash: Uint8Array, vaultId: string, protocol: string, network: Network): Promise<Uint8Array> {
        const payload = {
            rawMessageData: {
                messages: [{
                    content: Buffer.from(txHash).toString('hex')
                }]
            }
        };

        const vault: FireblocksVault = this.getVault(vaultId);
        const fb: FireblocksSDK = this.fbEngines.get(vaultId)!;

        const fireblocksTx = await fb.createTransaction({
            assetId: PROTOCOL_MAPPING.get(`${protocol}-${network}`),
            operation: TransactionOperation.RAW,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: vault.fireblocksId
            },
            extraParameters: payload
        });
        
        let tx: TransactionResponse = await fb.getTransactionById(fireblocksTx.id);
        while (tx.status != TransactionStatus.COMPLETED) {
            console.log(`Current transaction status: ${tx.status}`);
            if (tx.status == TransactionStatus.BLOCKED || tx.status == TransactionStatus.FAILED || tx.status == TransactionStatus.REJECTED || tx.status == TransactionStatus.CANCELLED) {
              throw Error(`Transaction was not completed | STATUS: ${tx.status}.`);
            }
            tx = await fb.getTransactionById(fireblocksTx.id);
            await setTimeout(5000);
        }

        console.log(`Current transaction status: ${tx.status}`);

        const signature: Uint8Array = Uint8Array.from(Buffer.from(tx.signedMessages![0].signature.fullSig, 'hex'));

        return signature;
    }
}
