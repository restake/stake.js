import { EthereumStakingProtocol } from "../interfaces/index.js";
import { Wallet } from "../../index.js";

export default class EthereumStakingProvider implements EthereumStakingProtocol {
    constructor() {

    }

    async init(): Promise<void> {
        return;
    }

    stake(wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
