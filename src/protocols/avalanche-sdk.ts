import { Avalanche, BinTools, Buffer, BN } from "avalanche"
import { ProtocolSDK } from "./protocol-sdk";
import { Wallet } from '../wallets/wallet';
import { Network } from '../types/global'; 
import { UnsignedTx, Tx } from "avalanche/dist/apis/platformvm";
import { sha256 } from "ethereumjs-util";
import { createHash } from "crypto";

const networkMappings: Record<Network, string> = {
    "mainnet": "mainnet",
    "testnet": "fuji",
 };

const AVALANCHE_NETWORK_NAME = 'fuji';
const AVALANCHE_NETWORK_ID = 5;

export class AvalancheProtocol extends ProtocolSDK {

    client: Avalanche
    

    constructor(wallet: Wallet) {
        super('avalanche', wallet);
        this.client = AvalancheProtocol.getClient(networkMappings[this.wallet.network]);
    }

    private static getNodeURL(network: string): string {
        if (network === 'fuji') {
          return 'https://api.avax-test.network';
        } else {
          return 'https://api.avax.network';
        }
      };

    private static getClient(network: string): Avalanche {
        const url = new URL(AvalancheProtocol.getNodeURL(network));

        const client = new Avalanche(
          url.hostname,
          parseInt(url.port),
          url.protocol.replace(':', ''),
          AVALANCHE_NETWORK_ID,
          undefined, //'X',
          undefined, //'C',
          network,
        );

        // @ts-ignore
        client.setRequestConfig("validateStatus", (status) => {
            return true;
        });

        return client;
    }

    public async buildStakeTransaction(validator: string, amount: string, keyPairId?: string): Promise<UnsignedTx> {
        const client = AvalancheProtocol.getClient("fuji");
        const pChain = client.PChain();
        const chainId = pChain.getBlockchainID();
        const pAddress = await this.wallet.getAddress(this.protocol, keyPairId);

        console.log("address: %s, chainId: %s", pAddress, chainId, pChain);

        const { utxos } = await pChain.getUTXOs(pAddress, chainId).catch((err: Error) => {
            // @ts-ignore
            console.error("failed to get utxos", err.response);
            throw err;
        });
        const dateStart = new Date(new Date().getTime()+10000);
        const dateEnd = new Date(dateStart.getTime()+1209600000)
        
        return await pChain.buildAddDelegatorTx(
            utxos,
            [pAddress],
            [pAddress],
            [pAddress],
            validator,
            new BN(dateStart.getTime()/1000),
            new BN(dateEnd.getTime()/1000),
            new BN(amount),
            [pAddress],
            new BN("2"),
            undefined,
            undefined,
            undefined,
        );
    }

    public async buildClaimTransaction(validator: string, amount: number, keyPairId?: string): Promise<UnsignedTx> {
        const pChain = this.client.PChain();
        const chainId = await this.client.Info().getBlockchainID('P');
        const pAddress = await this.wallet.getAddress(this.protocol, keyPairId);
    
        const {utxos} = await pChain.getUTXOs(pAddress, chainId);

        throw new Error();
    }

    //public async getTransactionStatus(wallet: Wallet, vaultId: string, validator: string, amount?: number): Promise<Transaction> {
    //    throw new Error();
    //}

    private getTxHash(rawTx: UnsignedTx): Uint8Array {
        const txBuf: Buffer = rawTx.toBuffer()
        const sha256Hash: Buffer = Buffer.from(
            createHash("sha256").update(txBuf).digest().buffer
          )
        return sha256Hash;
    }

    public async signTransaction(rawTx: UnsignedTx, keyPairId?: string): Promise<Tx> {


        const signedTx: Tx = await this.wallet.signAvaTx(this.protocol, rawTx, keyPairId);

        return signedTx;
    }

    public async broadcastTransaction(signedTx: Tx): Promise<string> {
        const pChain = this.client.PChain();
        return pChain.issueTx(signedTx);
    }
};
