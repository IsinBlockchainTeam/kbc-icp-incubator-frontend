import {Service} from "./Service";
import {DocumentStrategy} from "../strategies/document/DocumentStrategy";
import {DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export class DocumentService<T> extends Service {
    private readonly _strategy: DocumentStrategy<T>;

    constructor(documentStrategy: DocumentStrategy<T>) {
        super();
        this._strategy = documentStrategy;
    }

    async getDocumentsByTypeAndTransactionId(id: number, type: DocumentType): Promise<T[]> {
        return this._strategy.getDocumentsByTypeAndTransactionId(id, type);
    }
}
