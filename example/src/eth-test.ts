import { transfer } from "@restake/staking-sdk/core/protocol/ethereum";
const privateKey = "46e3dcf7e01b8911ced3903a95c66d004ea61fa9eee887db70d3edd3142142c3"
const receiveAddress = "0x77f7195751737E8CF4fC0dcb6187CC57aD73a858"
const amount = 90
const senderAddress = "0x80E44E1562e2Df92bB6ae08f7c1c5721Ce8d3B24"

transfer(privateKey, receiveAddress, amount, senderAddress);
