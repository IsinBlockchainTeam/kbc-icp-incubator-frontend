import {
    DocumentService,
    TradeService,
    TradeManagerService,
    DocumentType,
    DocumentDriver,
    ICPFileDriver,
    TradeManagerServiceArgs,
    DocumentStatus
} from '@kbc-lib/coffee-trading-management-lib';
import { EthDocumentService } from 'src/api/services/EthDocumentService';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthDocumentService', () => {
    let ethDocumentService: EthDocumentService;
    let documentService: DocumentService;
    let tradeManagerService: TradeManagerService;
    let getTradeService: (trade: string) => TradeService;
    const getAllDocuments = jest.fn();
    const getDocumentStatus = jest.fn();
    const getDocumentsByType = jest.fn();

    beforeEach(() => {
        documentService = new DocumentService({} as DocumentDriver, {} as ICPFileDriver);
        tradeManagerService = new TradeManagerService({} as TradeManagerServiceArgs);
        getTradeService = jest.fn().mockReturnValue({
            getAllDocuments,
            getDocumentStatus,
            getDocumentsByType
        } as unknown as TradeService);
        ethDocumentService = new EthDocumentService(
            documentService,
            tradeManagerService,
            getTradeService
        );
    });

    it('should successfully get documents by transaction id', async () => {
        getAllDocuments.mockResolvedValue([
            { externalUrl: 'content.json' },
            { externalUrl: 'url', uploadedBy: 'user' }
        ]);
        getDocumentStatus.mockResolvedValue(DocumentStatus.APPROVED);
        tradeManagerService.getTrade = jest.fn().mockResolvedValue(1);
        documentService.getCompleteDocument = jest.fn().mockResolvedValue({
            id: 1,
            content: 'content',
            filename: 'filename',
            documentType: DocumentType.BILL_OF_LADING,
            date: new Date(),
            transactionLines: []
        });

        const response = await ethDocumentService.getDocumentsByTransactionId(1);
        expect(response).toHaveLength(1);
        expect(response[0].id).toBe(1);
        expect(response[0].uploadedBy).toBe('user');
        expect(response[0].documentType).toBe(DocumentType.BILL_OF_LADING);
        expect(response[0].filename).toBe('filename');
        expect(response[0].status).toBe(DocumentStatus.APPROVED);
    });

    it('should successfully get documents info by transaction id and document type', async () => {
        getDocumentsByType.mockResolvedValue([
            { id: 1, uploadedBy: 'user' },
            { id: 2, uploadedBy: 'user' }
        ]);
        getDocumentStatus.mockResolvedValue(DocumentStatus.APPROVED);
        tradeManagerService.getTrade = jest.fn().mockResolvedValue(1);
        documentService.getCompleteDocument = jest.fn().mockResolvedValue({
            id: 1,
            content: 'content',
            filename: 'filename',
            documentType: DocumentType.BILL_OF_LADING,
            date: new Date(),
            transactionLines: []
        });

        const response = await ethDocumentService.getDocumentsInfoByTransactionIdAndDocumentType(
            1,
            DocumentType.BILL_OF_LADING
        );
        expect(response).toHaveLength(2);

        expect(response[0].id).toBe(1);
        expect(response[0].uploadedBy).toBe('user');
        expect(response[0].status).toBe(DocumentStatus.APPROVED);
        expect(response[1].id).toBe(2);
    });
});
