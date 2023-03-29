import { NEARStakingProtocol } from "../interfaces/index.js";
import { Wallet } from "../../index.js";

export default class NEARStakingProvider implements NEARStakingProtocol {
    constructor() {

    }

    async init(): Promise<void> {
        return;
    }

    stake(wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }

    unstake(wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }

    withdraw(wallet: Wallet): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
