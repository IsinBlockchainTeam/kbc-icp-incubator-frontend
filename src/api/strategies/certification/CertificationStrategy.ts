export interface CertificationStrategy<T, R> {
    getCertifications(): Promise<T[]>;

    getCertificationById(id: number): Promise<T>;

    getCertificationsByTransactionId(id: number, transactionType: string): Promise<T[]>;

    getSustainabilityCriteria(): Promise<R[]>;
}
