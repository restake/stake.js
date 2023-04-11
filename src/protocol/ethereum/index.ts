import { EthereumStakingProtocol } from "../interfaces/index.js";
import { Wallet } from "../../index.js";

export default class EthereumStakingProvider implements EthereumStakingProtocol {
    constructor() {
        // No-op
    }

    async init(): Promise<void> {
        return;
    }

    stake(_wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
