import { AvalancheStakingProtocol } from "../interfaces/index.js";
import { Wallet } from "../../index.js";

export default class AvalancheStakingProvider implements AvalancheStakingProtocol {
    constructor() {

    }

    async init(): Promise<void> {
        return;
    }

    stake(wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
