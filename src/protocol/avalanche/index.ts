import { AvalancheStakingProtocol } from "../interfaces/index.js";
import { Wallet } from "../../index.js";

export default class AvalancheStakingProvider implements AvalancheStakingProtocol {
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
