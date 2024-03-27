import {DocumentPresentable} from "../DocumentPresentable";
import {DocumentType, TransactionLine} from "@kbc-lib/coffee-trading-management-lib";

describe('DocumentPresentable', () => {
    const documentPresentable: DocumentPresentable = new DocumentPresentable();

    it('should be empty', () => {
        expect(documentPresentable.id).toBeUndefined();
        expect(documentPresentable.name).toBeUndefined();
        expect(documentPresentable.contentType).toBeUndefined();
        expect(documentPresentable.documentType).toBeUndefined();
        expect(documentPresentable.filename).toBeUndefined();
        expect(documentPresentable.content).toBeUndefined();
        expect(documentPresentable.date).toBeUndefined();
        expect(documentPresentable.transactionLines).toBeUndefined();
    });

    it('should set id', () => {
        documentPresentable.setId(1);
        expect(documentPresentable.id).toBe(1);
    });

    it('should set name', () => {
        documentPresentable.setName('name');
        expect(documentPresentable.name).toBe('name');
    });

    it('should set contentType', () => {
        documentPresentable.setContentType('contentType');
        expect(documentPresentable.contentType).toBe('contentType');
    });

    it('should set documentType', () => {
        documentPresentable.setDocumentType(DocumentType.DELIVERY_NOTE);
        expect(documentPresentable.documentType).toBe(DocumentType.DELIVERY_NOTE);
    });

    it('should set filename', () => {
        documentPresentable.setFilename('filename');
        expect(documentPresentable.filename).toBe('filename');
    });

    it('should set content', () => {
        documentPresentable.setContent(new Blob([]))
        expect(documentPresentable.content).toEqual(new Blob([]));
    });

    it('should set date', () => {
        const mockedDate: Date = new Date('2021-01-01T00:00:00.000Z');
        documentPresentable.setDate(mockedDate);
        expect(documentPresentable.date).toEqual(mockedDate);
    });

    it('should set transactionLines', () => {
        const newTransactionLine: TransactionLine = {
            id: 1,
            quantity: 10,
        };
        documentPresentable.setTransactionLines([newTransactionLine]);
        expect(documentPresentable.transactionLines).toEqual([newTransactionLine]);
    });
});
