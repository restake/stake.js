export interface StakeParameters<T> {
    validatorId: string;
    amount: string;
    protocolSpecific: T;
}
