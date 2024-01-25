export interface DocumentStrategy<T> {
    getDocumentsByTransactionIdAndType(id: number, type: string): Promise<T[]>;

}
