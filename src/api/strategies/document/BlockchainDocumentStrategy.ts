import {Strategy} from "../Strategy";
import {DocumentStrategy} from "./DocumentStrategy";
import {DocumentPresentable} from "../../types/DocumentPresentable";
import {DocumentService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {ErrorHandler} from "../../../utils/error/ErrorHandler";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";
import {CompanyPodInfo} from "../../types/solid";
import {SolidServerService} from "../../services/SolidServerService";

export class BlockchainDocumentStrategy extends Strategy implements DocumentStrategy<DocumentPresentable> {
    private readonly _documentService: DocumentService;
    private readonly _solidService?: SolidServerService;

    constructor(solidPodInfo?: CompanyPodInfo) {
        super(true);
        this._documentService = BlockchainLibraryUtils.getDocumentService();
        if (solidPodInfo)
            this._solidService = new SolidServerService(solidPodInfo.serverUrl, solidPodInfo.clientId, solidPodInfo.clientSecret);
    }

    async getDocumentsByTransactionIdAndType(id: number, type: string): Promise<DocumentPresentable[]> {
        this.checkService(this._solidService);
        const documentsInfo = await this._documentService.getDocumentsInfoByTransactionIdAndType(id, type);
        return Promise.all(documentsInfo.map(async (d) => {
            const { filename, date, lines } = await this._solidService!.retrieveMetadata(d.externalUrl);
            const fileContent = await this._solidService!.retrieveFile(d.externalUrl);

            ErrorHandler.manageUndefinedOrEmpty(fileContent, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
            return new DocumentPresentable()
                .setId(d.id)
                .setName(d.name)
                .setContentType(fileContent!.type)
                .setDocumentType(d.documentType)
                .setContent(fileContent!)
                .setFilename(filename)
                .setTransactionLines(lines)
                .setDate(new Date(date))
            })
        );
    }

}
