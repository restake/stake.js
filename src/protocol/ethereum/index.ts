import { EthereumStakingProtocol } from "../interfaces/index.ts";
import { Wallet } from "../../index.ts";

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
