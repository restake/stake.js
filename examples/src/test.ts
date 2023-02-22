import { Avalanche, BinTools, Buffer, BN } from "avalanche";
import { sha256 } from '@noble/hashes/sha256';
import { AddDelegatorTx } from "avalanche/dist/apis/platformvm";
import { Address } from 'ethereumjs-util';

const AVALANCHE_NETWORK_ID = 1;
const AVALANCHE_NETWORK_NAME = 'mainnet';

export const getNodeURL = (network: string) => {
  if (network === 'mainnet') {
    return 'https://api.avax.network';
  } else {
    return 'https://api.avax-test.network';
  }
};

export const getAvalancheClient = (network: string) => {
  const url = new URL(getNodeURL(network));

  const client = new Avalanche(
    url.hostname,
    parseInt(url.port),
    url.protocol.replace(':', ''),
    AVALANCHE_NETWORK_ID,
    undefined, //'X',
    undefined, //'P',
    network,
  );
  return client;
};

export const transactionUrl = (txId: string) => {
  return `https://explorer.avax.network/tx/${txId}`;
};

export const accountExplorer = (network: string) => (address: string) => {
  return `https://explorer.avax.network/address/${address}`;
};

const network = "fuji"
const address = "X-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz"
const recipient = "X-fuji1d8an7xzl7vz5sx74w56pc3aye7gpp3zrhlqejx"
const secret = "PrivateKey-ntFeL5b3raNyEZ2VJro7oEj2WHAvkkoG4xRPABmdKV8mW8yGL"    
const dateStart = "1675253445";
const dateEnd =   "1675771845";
const validatorID = "NodeID-JjvzhxnLHLUQ5HjVRkvG827ivbLXPwA9u";
const amount = "1000000000";


const balance = async function (network: string, address: string) {

    const client = getAvalancheClient(network);
    const chain = client.XChain();
    const balance = await chain.getBalance(address, "AVAX"); //as BalanceT;

    return balance.balance
};

const transfer = async function (network: string, address: string, amount: string, secret: string, recipient: string) {

    const client = getAvalancheClient(network);
    const chain = client.XChain();
    const keychain = chain.keyChain();
    keychain.importKey(secret);

    // Fetch UTXO (i.e unspent transaction outputs)
    const { utxos } = await chain.getUTXOs(address);

    // Determine the real asset ID from its symbol/alias
    // We can also get the primary asset ID with chain.getAVAXAssetID() call
    const binTools = BinTools.getInstance();
    const assetInfo = await chain.getAssetDescription("AVAX");
    const assetID = binTools.cb58Encode(assetInfo.assetID);

    // Create a new transaction
    const transaction = await chain.buildBaseTx(
      utxos, // Unspent transaction outputs
      new BN(amount), // Transaction amount, formatted as a BigNumber
      assetID, // AVAX asset
      [recipient], // Addresses we are sending the funds to (receiver)
      [address], // Addresses being used to send the funds from the UTXOs provided (sender)
      [address], // Addresses that can spend the change remaining from the spent UTXOs (payer)
    );

    // Sign the transaction and send it to the network
    const signedTx = transaction.sign(keychain);
    const hash = await chain.issueTx(signedTx);
};

const chainExport = async function (network: string, secret: string, amount: string) {
    const client = getAvalancheClient(network);

    // Taking inspiration for xChain do the same for cChain
    const [xChain, pChain] = [client.XChain(), client.PChain()];
    const [xKeychain, pKeychain] = [xChain.keyChain(), pChain.keyChain()];
    const [xKeypair, pKeypair] = [xKeychain.importKey(secret), pKeychain.importKey(secret)];
    const [xAddress, pAddress] = [xKeypair.getAddressString(), pKeypair.getAddressString()];

    // Fetch UTXOs (unspent transaction outputs)
    const {utxos} = await xChain.getUTXOs(xAddress);

    // Get the real ID for the cChain
    const chainId = await client.Info().getBlockchainID('P');

    // Prepare the export transaction from X -> P chain
    const exportTx = await xChain.buildExportTx(
        utxos, // Unspent transaction outputs
        new BN(amount), // Transfer amount
        chainId, // Target chain ID (for P-Chain)
        ['P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz'], // Addresses being used to send the funds from the UTXOs provided
        [xAddress], // Addresses being used to send the funds from the UTXOs provided
        [xAddress], // Addresses that can spend the change remaining from the spent UTXOs
      );

    // Sign and send the transaction
    const hash = await xChain.issueTx(exportTx.sign(xKeychain));
};

const chainImport = async function (network: string, secret: string) {
    const client = getAvalancheClient(network);
    
    // Initialize chain components
    const [xChain, pChain] = [client.XChain(), client.PChain()];
    const [xKeychain, pKeychain] = [xChain.keyChain(), pChain.keyChain()];
    const [xKeypair, pKeypair] = [
        xKeychain.importKey(secret),
        pKeychain.importKey(secret),
    ];
    const [pAddress, xAddress] = [pKeypair.getAddressString(), xKeypair.getAddressString()];

    // Get the real ID for X-Chain
    const xChainId = await client.Info().getBlockchainID('X');

    // Fetch UTXOs (i.e unspent transaction outputs)
    const {utxos} = await pChain.getUTXOs(pAddress, xChainId);

    // Generate an unsigned import transaction
    const importTx = await pChain.buildImportTx(
        utxos,
        [pAddress],
        xChainId,
        [pAddress],
        [pAddress],
    );

    // Sign and send import transaction
    const hash = await pChain.issueTx(importTx.sign(pKeychain));
};
/*
const delegate = async function (network: string, secret: string, validatorID: string, dateStart: string, dateEnd: string) {
    const client = getAvalancheClient(network);

    console.log(network);

    const pChain = client.PChain();
    const pKeychain = pChain.keyChain();
    const pKeypair = pKeychain.importKey(secret);
    const pAddress = pKeypair.getAddressString();

    console.log(pAddress);

    const chainId = pChain.getBlockchainID(); //await client.Info().getBlockchainID('P');
    const {utxos} = await pChain.getUTXOs("P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz", "11111111111111111111111111111111LpoYY").catch((err: Error) => {
        // @ts-ignore
        console.error("failed to get utxos", err.response);
        throw err;
    });

    console.log(utxos);

    const delegateTx = await pChain.buildAddDelegatorTx(
        utxos,
        [pAddress],
        [pAddress],
        [pAddress],
        validatorID,
        new BN(dateStart),
        new BN(dateEnd),
        new BN(amount),
        [pAddress],
        new BN("2"),
        undefined,
        undefined,
        undefined,
    );
    
    //console.log(delegateTx);
    //const hash = await pChain.issueTx(delegateTx.sign(pKeychain));
};
*/

const getAmount = async function (txID: string): Promise<number | null> {
    const client = getAvalancheClient(network);
    const pChain = client.PChain();

    const rewardUTXO = await pChain.getRewardUTXOs(txID);
    //console.log(rewardUTXO.utxos);

    if (rewardUTXO.utxos.length <= 0) {
        //throw new Error("No reward UTXOs")
        return null;
    }
    //const amountHEX = rewardUTXO.utxos[1].slice(150,166);
    //console.log(amountHEX);
    /*
    const delegatorRewardUTXOs = rewardUTXO.utxos.filter(utxo=>{
        console.log(utxo);
        //let UTXOstring = utxo.slice(2)
        //let check = UTXOstring.slice(179, 180);
        //console.log(check);

        return check==="1";
    })

    let amount = 0;
    for (const rewardUTXO of delegatorRewardUTXOs) {
        //console.log(rewardUTXObuffer.length);
        //const rewardUTXObuffer = Buffer.from(rewardUTXO, 'hex');//    console.log(amount);
        //console.log(rewardUTXObuffer);
        //const amountBuffer = rewardUTXObuffer.slice(74, 82);
        //console.log(amountBuffer);
        //const amountHEX = amountBuffer.toString('hex');
        const amountHEX = rewardUTXO.slice(150,166);
        amount += parseInt(amountHEX, 16);

    }
    */
    //const amount = 0
    const amountOne = parseInt(rewardUTXO.utxos[0].slice(150,166), 16);
    const amountTwo = parseInt(rewardUTXO.utxos[1].slice(150,166), 16);

    if (amountOne < amountTwo) {return amountTwo}
    else {return amountOne};
}

const getTxID = async function (txIDCB58: string): Promise<string> {
    const client = getAvalancheClient(network);
    const binTools = BinTools.getInstance();
    const pChain = client.PChain();
    const chainId = pChain.getBlockchainID();
    const {utxos} = await pChain.getUTXOs("P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz", chainId).catch((err: Error) => {
        // @ts-ignore
        console.error("failed to get utxos", err.response);
        throw err;
    });

    const dekodeeritud = binTools.cb58Decode(txIDCB58);
//    console.log(dekodeeritud.length);
    const txID = binTools.cb58Encode(dekodeeritud.slice(2,34));
    return txID;
};

const txArray: (string|number)[]=[];

const client = getAvalancheClient(network);
const pChain = client.PChain();
const chainId = pChain.getBlockchainID();
const {utxos} = await pChain.getUTXOs("P-fuji15t0akjk9mr8qspg2295a6uxq63ycmnxryycjdz", chainId);
//console.log(utxos);

const array = utxos.getAllUTXOStrings();
const unixTime = 1675246404;
console.log(array);



for (let utxo of array) {
    const txID = await getTxID(utxo);
    const transaction: string | object = await pChain.getTx(txID, 'json');
    const tx: any = typeof transaction === "string" ? JSON.parse(transaction) : transaction as any;
    
    if (!txArray.includes(txID)){
        if (!txArray.includes(tx.unsignedTx.validator?.end)){
            if (tx.unsignedTx.validator?.end && tx.unsignedTx.validator.end  > unixTime && tx.unsignedTx.validator.end*1000 < Date.now()){
                console.log(txID);
                const date = new Date(tx.unsignedTx.validator.end * 1000);
                console.log(date);
                //console.log("End date: %s, date now: %s", tx.unsignedTx.validator.end*1000, Date.now())
                const amount = await getAmount(txID);
                console.log(amount)
                txArray.push(txID, tx.unsignedTx.validator?.end);
            }
        }
    }
    //console.log(txArray)
}


//console.log(await pChain.getTx("AyVPSSogJVfYGQzWebbnzqmneWcMpeCtSmUhTG5egNT2wq4Gk", 'json'))
//console.log(await pChain.getTx("AoFfH3418143ZjEMkwpiVo9WbBnDRHL7cvd4DSKMdF34Q5eWG", 'json'))

//const transa = JSON.parse(transaction)
//console.log(tx.unsignedTx.validator.end>1673684255);


//const amount2 = await getAmount("2u2sdbzmmMmroHidxF83ktw9Rk2txC43ss5sP1ohf9aZSbuUYm")
//console.log(amount2)

/*
(async () => {
    const bal = await balance(network, recipient);
    console.log(`The balance for %s netwrok with address %s is %s`, network, recipient, bal);
})().catch(err => {
    console.error(err);
});*/

/*
(async () => {
    transfer(network, address, amount, secret, recipient);
    console.log(`%s was sent from %s to %s`, amount, address, recipient);
})().catch(err => {
    console.error(err);
});*/


//(async () => {
    //chainExport(network, secret, amount);
    //console.log(`%s was sent from %s to %s`, amount, address, recipient);
    //chainImport(network, secret);
//delegate(network, secret, validatorID, dateStart, dateEnd);
//getTxID(network, secret, validatorID, dateStart, dateEnd);
    //hash(signer(delegate));
//})().catch(err => {
//    console.error(err);
//});
