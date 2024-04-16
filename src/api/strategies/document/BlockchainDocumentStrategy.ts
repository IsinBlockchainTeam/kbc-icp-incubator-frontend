import {Strategy} from "../Strategy";
import {DocumentStrategy} from "./DocumentStrategy";
import {DocumentPresentable} from "../../types/DocumentPresentable";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {ErrorHandler} from "../../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";
import {SolidSpec} from "../../types/storage";

export class BlockchainDocumentStrategy extends Strategy implements DocumentStrategy<DocumentPresentable> {
    private readonly _documentService;

    constructor(storageSpec?: SolidSpec) {
        super(true);
        this._documentService = BlockchainLibraryUtils.getDocumentService(storageSpec);
    }

    async getDocumentsByTransactionIdAndType(id: number, type: string): Promise<DocumentPresentable[]> {
        const documentsInfo = await this._documentService.getDocumentsInfoByTransactionIdAndType(id, type);
        return Promise.all(documentsInfo.map(async (d) => {
            const completeDocument = await this._documentService.getCompleteDocument(d,
                { entireResourceUrl: d.externalUrl },
                { entireResourceUrl: d.externalUrl }
            );
            console.log('completeDocument: ', completeDocument);
            ErrorHandler.manageUndefinedOrEmpty(completeDocument, HttpStatusCode.NOT_FOUND, `There are no external information related to the document with id: ${d.id}`);
            ErrorHandler.manageUndefinedOrEmpty(completeDocument!.content, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
            return new DocumentPresentable()
                .setId(completeDocument!.id)
                .setName(completeDocument!.name)
                .setContentType(completeDocument!.content!.type)
                .setDocumentType(completeDocument!.documentType)
                //.setContent(completeDocument!.content)
                .setFilename(completeDocument!.filename)
                .setTransactionLines(completeDocument!.transactionLines)
                .setDate(new Date(completeDocument!.date))
            })
        );
    }

}
