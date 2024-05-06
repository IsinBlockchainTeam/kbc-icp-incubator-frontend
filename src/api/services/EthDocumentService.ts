import {Service} from "./Service";
import {DocumentPresentable} from "../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {ErrorHandler} from "../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../utils/error/HttpStatusCode";
import {SolidSpec} from "../types/storage";
import { DocumentInfo } from "@kbc-lib/coffee-trading-management-lib";

export class EthDocumentService<T> extends Service {
    private readonly _documentService;
    private readonly _tradeManagerService;

    constructor(storageSpec?: SolidSpec) {
        super();
        this._documentService = BlockchainLibraryUtils.getDocumentService(storageSpec);
        this._tradeManagerService = BlockchainLibraryUtils.getTradeManagerService(storageSpec);
    }

    async getDocumentsByTransactionId(id: number): Promise<DocumentPresentable[]> {
        const tradeService = BlockchainLibraryUtils.getTradeService(await this._tradeManagerService.getTrade(id));
        const documentsInfo = await tradeService.getAllDocuments();
        return Promise.all(documentsInfo.map(async (d: DocumentInfo) => {
                const completeDocument = await this._documentService.getCompleteDocument(d,
                    { entireResourceUrl: d.externalUrl },
                    { entireResourceUrl: d.externalUrl }
                );
                ErrorHandler.manageUndefinedOrEmpty(completeDocument, HttpStatusCode.NOT_FOUND, `There are no external information related to the document with id: ${d.id}`);
                ErrorHandler.manageUndefinedOrEmpty(completeDocument!.content, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
                return new DocumentPresentable()
                    .setId(completeDocument!.id)
                    // .setContentType(completeDocument!.content!.type)
                    // .setDocumentType(type)
                    .setContent(completeDocument!.content)
                    .setFilename(completeDocument!.filename)
                    .setTransactionLines(completeDocument!.transactionLines)
                    .setDate(new Date(completeDocument!.date))
            })
        );
    }
}
