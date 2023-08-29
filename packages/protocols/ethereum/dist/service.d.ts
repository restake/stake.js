import './constants.js';
import { ProtocolService, SignerWallet } from '@restake/stakejs-core';
import { EthereumTransactionEngine } from './transactionEngine.js';
import { EthereumNetwork, EthereumDepositData } from './types.js';
import 'zod';
import 'ethers';

declare class EthereumService extends ProtocolService<EthereumTransactionEngine> {
    tx: EthereumTransactionEngine;
    constructor(network?: EthereumNetwork, rpcUrl?: URL);
    stake(wallet: SignerWallet, depositData: EthereumDepositData, selector?: string): Promise<string>;
}

export { EthereumService };
