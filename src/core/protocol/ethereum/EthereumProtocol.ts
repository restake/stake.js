import Web3 from "web3";
import { Account } from "web3-core";
import { AbiItem } from "web3-utils";
import web3eth from "web3-eth";

const web3 = new Web3("HTTP://127.0.0.1:7545");

export async function stake(){
  const eth = new web3eth.Eth(web3.currentProvider);
  const chainId = await eth.getChainId();
  const gasPrice = await eth.getGasPrice();

  /*
  const contractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
  const myContractAbi: AbiItem[] = [
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address"
        }
      ],
      name: "deposit",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "payable",
      type: "function"
    }
  ];

  const contract = new web3.eth.Contract(myContractAbi, contractAddress);

  const tx = {
    from: account.address,
    to: contractAddress,
    value: web3.utils.toWei(amount.toString(), "ether"),
    data: contract.methods.deposit(validatorPublicKey).encodeABI(),
    chainId,
    gasPrice,
    gas: 200000
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

  return receipt.transactionHash;

  */
 return chainId;
}
