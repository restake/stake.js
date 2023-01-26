import { FileSystemWallet } from 'staking-sdk';

const fsWallet = new FileSystemWallet('testnet', '/keys/test-wallet.json');

const validator = 'shurik.pool.f863973.m0';
const amount = 1.;

const txId = await fsWallet.near.stake(validator, amount);
console.log(txId);
