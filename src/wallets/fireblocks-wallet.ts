import { Wallet } from "./wallet";
import { DepositAddressResponse, FireblocksSDK, PeerType, TransactionOperation, TransactionResponse, TransactionStatus } from "fireblocks-sdk";
import { setTimeout } from "timers/promises";
import { Network, Protocol } from "../types/global";
import { FireblocksProvider } from "../providers/fireblocks-provider";
import { UnsignedTx, Tx } from "avalanche/dist/apis/platformvm";

const PROTOCOL_MAPPING: Map<string, string> = new Map([
    ['near-protocol-mainnet', 'NEAR'],
    ['near-protocol-testnet', 'NEAR_TEST'],
    ['ethereum-testnet', 'ETH_TEST3'],
    ['ethereum-mainnet', 'ETH']
]);

export class FireblocksWallet extends Wallet {

    fbProvider: FireblocksProvider;

    constructor(network: Network, apiKey: string, secretKey: string, vaultId: string) {
        super(network);
        this.fbProvider = new FireblocksProvider(apiKey, secretKey, vaultId);
    }

    get fb(): FireblocksSDK {
        return this.fbProvider.fbEngine;
    }

    get vaultId(): string {
        return this.fbProvider.vaultId;
    }

    private getAssetId(protocol: string, network: Network): string {
        const assetId: string | undefined = PROTOCOL_MAPPING.get(`${protocol}-${network}`);
        if (!assetId) {
            throw new Error(`Protocol ${protocol} with network ${network} is not supported by Fireblocks`);
        }
        return assetId;
    }

    async getAddress(protocol: string, network: Network): Promise<string> {
        const address: DepositAddressResponse[] = await this.fb.getDepositAddresses(this.vaultId, this.getAssetId(protocol, network));
        return address[0].address;
    }

    async signTxHash(protocol: string, txHash: Uint8Array): Promise<Uint8Array> {
        const payload = {
            rawMessageData: {
                messages: [{
                    content: Buffer.from(txHash).toString('hex')
                }]
            }
        };

        const fireblocksTx = await this.fb.createTransaction({
            assetId: this.getAssetId(protocol, this.network),
            operation: TransactionOperation.RAW,
            source: {
                type: PeerType.VAULT_ACCOUNT,
                id: this.vaultId
            },
            extraParameters: payload
        });
        
        let tx: TransactionResponse = await this.fb.getTransactionById(fireblocksTx.id);
        while (tx.status != TransactionStatus.COMPLETED) {
            console.log(`Current transaction status: ${tx.status}`);
            if (tx.status == TransactionStatus.BLOCKED || tx.status == TransactionStatus.FAILED || tx.status == TransactionStatus.REJECTED || tx.status == TransactionStatus.CANCELLED) {
              throw Error(`Transaction was not completed | STATUS: ${tx.status}.`);
            }
            tx = await this.fb.getTransactionById(fireblocksTx.id);
            await setTimeout(5000);
        }

        console.log(`Current transaction status: ${tx.status}`);

        const signature: Uint8Array = Uint8Array.from(Buffer.from(tx.signedMessages![0].signature.fullSig, 'hex'));

        return signature;
    }

    async signAvaTx(protocol: Protocol, rawTx: UnsignedTx, keypairId?: string | undefined): Promise<Tx> {
        throw new Error();
    }
}
