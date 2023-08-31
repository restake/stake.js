# Stake.js

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/restake/stake.js/tree/master.svg?style=shield&circle-token=8de591d088f23c001c417fdc7228ddb6e688878d)](https://dl.circleci.com/status-badge/redirect/gh/restake/stake.js/tree/master)

`stake.js` is a library designed to simplify the integration of staking functionalities into your applications. This library is blockchain-agnostic, providing a unified interface for staking operations across various netowrks. It allows you to build, sign and broadcast staking transactions without having to worry about the underlying blockchain APIs.

## Dependencies

- [Node.js](https://nodejs.org/en) – `>= 18.15.x`
- A package manager: [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

## Installation
To install `stake.js` in your project, run one of the following commands:

If you're using **pnpm**:
```sh
pnpm add @restake/stakejs-ethereum
```

If you're using **yarn**:
```sh
yarn add @restake/stakejs-ethereum
```

If you're using **npm**:
```sh
npm install @restake/stakejs-ethereum
```

## Usage

Below is a simple example of how to use `stake.js` to stake ETH tokens using a Ledger device.
For more examples, check out the [examples](./examples) folder.

```js
import * as fs from "fs";
import { EthereumDepositData, EthereumService } from "@restake/stakejs-ethereum";
import { LedgerNodeWallet } from "@restake/stakejs-ledger-node";

const ethereum = new EthereumService({ name: "goerli" });

const depositData = EthereumDepositData.parse(JSON.parse(fs.readFileSync("./secrets/deposit-data.json", "utf8"))[0]);

const wallet = new LedgerNodeWallet();

const txId = await ethereum.tx.stake(wallet, depositData);
console.log(txId);
```

## Supported Protocols

- Ethereum
- NEAR Protocol

Coming soon:
- Sui
- Solana
- Avalanche
- Polkadot

## Design and Features

Behind the scenes, the library does the heavy lifting on the following key areas:

- Managing connection to the blockchain network
- Building protocol-specific `stake`, `deposit`, `unstake`, `withdraw` and `claim` operations
- Signing transactions, handling integrations with wallets and custody solutions, such as:
    - [Fireblocks](https://www.fireblocks.com)
    - [Ledger](https://www.ledger.com)
    - Any custom wallet that implements the `Wallet` interface
- Broadcasting transactions to the blockchain network

We also aim to keep the library as lightweight as possible. `Stake.js` is split in subpackages for each protocol and wallet. Whenever we can, we use libraries that support tree-shaking to decrease package size during bundling.

## Reporting Issues

If you encounter any issues while using stake.js, please report them on our GitHub issues page. When reporting an issue, please provide as much context as possible to help us understand and reproduce the problem. 

Restake takes security very seriously. Should you discover a vulnerability, please **DO NOT** submit a public PR. Instead, send your report privately to security@restake.net.

## Suggesting Enhancements

If you have ideas for new features or improvements to existing functionality, we'd love to hear about them. Please create a new issue on our GitHub issues page describing your suggestion.

## Code Contributions

If you'd like to contribute code to stake.js, here are the general steps:
1. Fork the stake.js repository on GitHub.
2. Clone your fork to your local machine.
3. Create a new branch for your changes.
4. Make your changes in your branch.
5. Push your changes to your fork on GitHub.
6. Submit a pull request from your fork to the stake.js repository.

Before submitting a pull request, please make sure your code follows our coding standards and all tests pass.

## License

MIT

