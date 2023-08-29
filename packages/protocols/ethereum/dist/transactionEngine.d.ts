import { TransactionEngine, Ethereum, SignerWallet } from '@restake/stakejs-core';
import { EthereumNetworkConfig, EthereumNetwork, EthereumDepositData, EthereumRawTransaction, EthereumSignedTransaction } from './types.js';
import './constants.js';
import 'zod';
import 'ethers';

declare class EthereumTransactionEngine implements TransactionEngine<Ethereum> {
    rpcUrl: URL;
    networkConfig: EthereumNetworkConfig;
    constructor(network?: EthereumNetwork, rpcUrl?: URL);
    private fetchGasLimitEstimate;
    private encodeDepositData;
    buildStakeTx(wallet: SignerWallet, depositData: EthereumDepositData, selector?: string): Promise<EthereumRawTransaction>;
    sign(wallet: SignerWallet, rawTx: EthereumRawTransaction, selector?: string | undefined): Promise<EthereumSignedTransaction>;
    broadcast(signedTx: EthereumSignedTransaction): Promise<string>;
}

export { EthereumTransactionEngine };
