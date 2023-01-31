import { Network, Protocol } from '../types/global';
import fs from 'fs'

export interface FileSystemKeyPair {
    id: string;
    protocol: Protocol;
    network: Network;
    address: string;
    privateKey: string;
}

export interface FileSystemWallet extends Array<FileSystemKeyPair> {}

export class FileSystemProvider {
    wallet: FileSystemWallet;

    constructor(filePath: string) {
        /*
        let BASE_PATH: string;
        if (process.env.BASE_PATH) {
            BASE_PATH = process.env.BASE_PATH;
        } else {
            BASE_PATH = '.';
        }
        */

        const fullPath: string = filePath; //BASE_PATH + filePath;
        const walletData: Buffer = fs.readFileSync(fullPath);
        this.wallet = JSON.parse(walletData.toString());
    }
}
