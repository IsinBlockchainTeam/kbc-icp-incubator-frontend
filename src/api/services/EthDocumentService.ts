import {Service} from "./Service";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {getMimeType} from "../../utils/utils";

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

        const documents: DocumentPresentable[] = [];

        for(const d of documentsInfo) {
            if(d.externalUrl.endsWith('.json')) continue;

            const completeDocument = await this._documentService.getCompleteDocument(d);
            const blob = new Blob([completeDocument!.content], { type: getMimeType(completeDocument.filename)});

            documents.push({
                id: completeDocument.id,
                contentType: blob.type,
                documentType: completeDocument.documentType,
                content: blob,
                filename: completeDocument.filename,
                date: new Date(completeDocument.date),
                transactionLines: completeDocument.transactionLines
            });
        }

        return documents;
    }
}
