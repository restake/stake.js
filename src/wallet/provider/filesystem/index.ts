import { Wallet } from "../../index.js";

export default class FilesystemWallet implements Wallet {
    #filePath: string;

    constructor(filePath: string) {
        this.#filePath = filePath;
    }
}
