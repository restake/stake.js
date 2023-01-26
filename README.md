# Staking SDK

This Software Development Kit provides functions to easily stake multiple cryptocurrencies from various custody and wallet solutions.

As a custody provider, it can be easily extended to quickly enable one-click staking in your customer facing platform. Feel free to contact us at contact@restake.net to discuss such an integration.

## Example

The following example shows how to build, sign and broadcast a NEAR staking transaction on testnet using a `FileSystemWallet` , i.e. a private key stored in file.

```
import { FileSystemWallet } from 'staking-sdk';

const fsWallet = new FileSystemWallet('testnet', '/keys/test-wallet.json');

const validator = 'shurik.pool.f863973.m0';
const amount = 1.;

const txId = await fsWallet.near.stake(validator, amount);
console.log(txId);
```

Examples can be found in the *examples* folder and can be run with the following commands:

```
yarn install
yarn run build
yarn run start-${protocol}
```
