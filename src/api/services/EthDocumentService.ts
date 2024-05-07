import {Service} from "./Service";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {DocumentInfo} from "@kbc-lib/coffee-trading-management-lib";
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

        return Promise.all(documentsInfo.map(async (d: DocumentInfo) => {
                const completeDocument = await this._documentService.getCompleteDocument(d);
                const blob = new Blob([completeDocument!.content], { type: getMimeType(completeDocument.filename)});

                return new DocumentPresentable()
                    .setId(completeDocument.id)
                    .setContentType(blob.type)
                    .setDocumentType(completeDocument.documentType)
                    .setContent(blob)
                    .setFilename(completeDocument.filename)
                    .setTransactionLines(completeDocument.transactionLines)
                    .setDate(new Date(completeDocument.date))
            })
        );
    }
}
