import {DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export interface DocumentStrategy<T> {
    getDocumentsByTransactionId(id: number): Promise<T[]>;

}
