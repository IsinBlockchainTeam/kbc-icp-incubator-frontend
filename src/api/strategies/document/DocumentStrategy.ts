import {DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export interface DocumentStrategy<T> {
    getDocumentsByTypeAndTransactionId(id: number, type: DocumentType): Promise<T[]>;

}
