import {
    DocumentService,
    TradeService, TradeManagerService, DocumentStatus
} from "@kbc-lib/coffee-trading-management-lib";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {getMimeType} from "../../utils/utils";

export class EthDocumentService {
    private readonly _documentService;
    private readonly _tradeManagerService;
    private readonly _getTradeService;

    constructor(documentService: DocumentService, tradeManagerService: TradeManagerService, getTradeService: (trade: string) => TradeService) {
        this._documentService = documentService;
        this._tradeManagerService = tradeManagerService;
        this._getTradeService = getTradeService;
    }

    async getDocumentsByTransactionId(id: number): Promise<DocumentPresentable[]> {
        const tradeService = this._getTradeService(await this._tradeManagerService.getTrade(id));
        const documentsInfo = await tradeService.getAllDocuments();

        const documents: DocumentPresentable[] = [];
        console.log("getDocumentsByTransactionId - documentsInfo: ", documentsInfo)

        for(const d of documentsInfo) {
            if(d.externalUrl.endsWith('.json')) continue;

            const completeDocument = await this._documentService.getCompleteDocument(d);
            const status = await tradeService.getDocumentStatus(d.id);
            console.log("getDocumentsByTransactionId - completeDocument: ", completeDocument, " status: ", status);
            const blob = new Blob([completeDocument!.content], { type: getMimeType(completeDocument.filename)});

            documents.push({
                id: completeDocument.id,
                contentType: blob.type,
                uploadedBy: d.uploadedBy,
                documentType: completeDocument.documentType,
                content: blob,
                filename: completeDocument.filename,
                date: new Date(completeDocument.date),
                transactionLines: completeDocument.transactionLines,
                status
            });
        }

        return documents;
    }
}
