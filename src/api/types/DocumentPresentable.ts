import {TransactionLine, DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export type DocumentPresentable = {
    id: number;
    contentType: string;
    documentType: DocumentType;
    content: Blob;
    filename: string;
    date: Date;
    transactionLines?: TransactionLine[];
};
