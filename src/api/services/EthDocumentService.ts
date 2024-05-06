import {Service} from "./Service";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {DocumentInfo, DocumentType} from "@kbc-lib/coffee-trading-management-lib";

export class EthDocumentService extends Service {
    private readonly _documentService;
    private readonly _tradeManagerService;

    constructor() {
        super();
        this._documentService = BlockchainLibraryUtils.getDocumentService();
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService();
    }

    async getDocumentsByTransactionId(id: number): Promise<DocumentPresentable[]> {
        const tradeService = BlockchainLibraryUtils.getTradeService(await this._tradeManagerService.getTrade(id));
        const documentsInfo = await tradeService.getAllDocuments();
        return Promise.all(documentsInfo.map(async (d: DocumentInfo) => {
                // TODO: handle possible error from lib
                const completeDocument = await this._documentService.getCompleteDocument(d);
                // ErrorHandler.manageUndefinedOrEmpty(completeDocument, HttpStatusCode.NOT_FOUND, `There are no external information related to the document with id: ${d.id}`);
                // ErrorHandler.manageUndefinedOrEmpty(completeDocument!.content, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
                return new DocumentPresentable()
                    .setId(completeDocument!.id)
                    // .setContentType(completeDocument!.content!.type)
                    .setDocumentType(DocumentType.PAYMENT_INVOICE)
                    .setContent(new Blob([completeDocument!.content]))
                    .setFilename(completeDocument!.filename)
                    .setTransactionLines(completeDocument!.transactionLines)
                    .setDate(new Date(completeDocument!.date))
            })
        );
    }
}
