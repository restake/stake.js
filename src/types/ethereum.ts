type DepositData = {
    pubkey: string,
    withdrawalCredentials: string,
    amount: number,
    signature: string,
    depositMessageRoot?: string,
    depositDataRoot: string 
}
