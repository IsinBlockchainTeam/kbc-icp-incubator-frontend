import {TransactionLine, DocumentType, DocumentStatus} from "@kbc-lib/coffee-trading-management-lib";

export type DocumentPresentable = {
    id: number;
    contentType: string;
    uploadedBy: string;
    documentType: DocumentType;
    content: Blob;
    filename: string;
    date: Date;
    transactionLines?: TransactionLine[];
    status: DocumentStatus;
};
