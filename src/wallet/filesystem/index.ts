import { Wallet, __USING_CORE_SDK } from "../../index.js";

export class FilesystemWallet implements Wallet {
    [__USING_CORE_SDK] = true;
    #filePath: string;

    constructor(filePath: string) {
        this.#filePath = filePath;
    }
}

export default FilesystemWallet;
