import {Service} from "./Service";
import {DocumentStrategy} from "../strategies/document/DocumentStrategy";

export class DocumentService<T> extends Service {
    private readonly _strategy: DocumentStrategy<T>;

    constructor(documentStrategy: DocumentStrategy<T>) {
        super();
        this._strategy = documentStrategy;
    }

    async getDocumentsByTransactionIdAndType(id: number, type: string): Promise<T[]> {
        return this._strategy.getDocumentsByTransactionIdAndType(id, type);
    }
}
