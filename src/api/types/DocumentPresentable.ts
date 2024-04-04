import {TransactionLine, DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export class DocumentPresentable {
    private _id: number;
    private _contentType: string;
    private _documentType: DocumentType;
    private _filename: string;
    private _content: Uint8Array;
    private _date: Date;
    private _transactionLines?: TransactionLine[];

    constructor(id?: number, contentType?: string, documentType?: DocumentType, filename?: string, content?: Uint8Array, date?: Date);
    constructor(id: number, contentType: string, documentType: DocumentType, filename: string, content: Uint8Array, date: Date) {
        this._id = id;
        this._contentType = contentType;
        this._documentType = documentType;
        this._filename = filename;
        this._content = content;
        this._date = date;
    }

    get id(): number {
        return this._id;
    }

    get contentType(): string {
        return this._contentType;
    }

    get documentType(): DocumentType {
        return this._documentType;
    }

    get content(): Uint8Array {
        return this._content;
    }

    get filename(): string {
        return this._filename;
    }

    get date(): Date {
        return this._date;
    }

    get transactionLines(): TransactionLine[] | undefined {
        return this._transactionLines;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setContentType(value: string): this {
        this._contentType = value;
        return this;
    }

    setDocumentType(value: DocumentType): this {
        this._documentType = value;
        return this;
    }

    setContent(value: Uint8Array): this {
        this._content = value;
        return this;
    }

    setFilename(value: string): this {
        this._filename = value;
        return this;
    }

    setDate(value: Date): this {
        this._date = value;
        return this;
    }

    setTransactionLines(value: TransactionLine[] | undefined): this {
        this._transactionLines = value;
        return this;
    }
}
