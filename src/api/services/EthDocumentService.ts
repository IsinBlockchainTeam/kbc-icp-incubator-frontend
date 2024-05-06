import {Service} from "./Service";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {ErrorHandler} from "../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";

export class EthDocumentService<T> extends Service {
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
        return Promise.all(documentsInfo.map(async (d) => {
                const documentInfo = await this._documentService.getDocumentInfoById(d.id);
                ErrorHandler.manageUndefinedOrEmpty(documentInfo, HttpStatusCode.NOT_FOUND, `There are no external information related to the document with id: ${d.id}`);
                // ErrorHandler.manageUndefinedOrEmpty(documentInfo!.content, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
                return new DocumentPresentable()
                    .setId(documentInfo!.id)
                    // .setContentType(documentInfo!.content!.type)
                    // .setDocumentType(type)
                    // .setContent(documentInfo!.content)
                    // .setFilename(documentInfo!.filename)
                    // .setTransactionLines(documentInfo!.transactionLines)
                    // .setDate(new Date(documentInfo!.date))
            })
        );
    }
}
