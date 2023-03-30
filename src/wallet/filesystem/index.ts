import { Wallet } from "../../index.js";

export class FilesystemWallet implements Wallet {
    #filePath: string;

    constructor(filePath: string) {
        this.#filePath = filePath;
    }
}

export default FilesystemWallet;
