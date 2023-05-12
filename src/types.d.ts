import type { BrowserProvider, Eip1193Provider } from "ethers";

type Ethereum = BrowserProvider & Eip1193Provider & { isConnected(): boolean; };

declare global {
    interface Window {
        ethereum?: Ethereum;
    }
}
