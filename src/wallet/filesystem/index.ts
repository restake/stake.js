import { Wallet, __WALLET_IMPL } from "../../index.js";

export class FilesystemWallet implements Wallet {
    [__WALLET_IMPL] = true;
    #filePath: string;

    constructor(filePath: string) {
        this.#filePath = filePath;
    }
}

export default FilesystemWallet;
