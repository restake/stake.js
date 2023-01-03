import { StringWallet, Fireblocks, StakingService } from 'staking-sdk'; 
import * as fs from 'fs';

const network = 'testnet';
const stk = new StakingService(network);

const stringWallet = new StringWallet([{
    id: 'near-staking-sdk-testnet',
    address: 'staking-sdk.testnet',
    privateKeyVarname: 'NEAR_PRIVATE_KEY',
    protocol: 'near-protocol',
    network: 'testnet'
}]);

// const fireblocksSecretKey = fs.readFileSync('./keys/fireblocks_secret.key', 'utf8');
// const fireblocksApiKey = process.env.FIREBLOCKS_API_KEY!

// const fireblocksWallet = new Fireblocks([{
//     id: 'staking-dev',
//     fireblocksId: '8',
//     secretKey: fireblocksSecretKey, 
//     apiKey: fireblocksApiKey
// }]);

const wallet = stringWallet;
const vaultId = 'near-staking-sdk-testnet'

const validator = 'shurik.pool.f863973.m0';
const amount = 0.5;

const tx = await stk.near.buildStakeTransaction(wallet, vaultId, validator, amount);
console.log(tx);

const txSigned = await stk.near.signTransaction(wallet, vaultId, tx);
console.log(txSigned);

const txId = await stk.near.broadcastTransaction(txSigned);
console.log(txId);
