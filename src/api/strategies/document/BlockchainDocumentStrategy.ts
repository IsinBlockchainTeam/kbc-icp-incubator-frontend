import { Strategy } from "../Strategy";
import { DocumentStrategy } from "./DocumentStrategy";
import { DocumentPresentable } from "../../types/DocumentPresentable";
import { DocumentService } from "@kbc-lib/coffee-trading-management-lib";
import { BlockchainLibraryUtils } from "../../BlockchainLibraryUtils";
import { ErrorHandler } from "../../../utils/error/ErrorHandler";
import { HttpStatusCode } from "../../../utils/error/HttpStatusCode";
import { request } from "../../../utils/request";
import { requestPath } from "../../../constants";

export class BlockchainDocumentStrategy
  extends Strategy
  implements DocumentStrategy<DocumentPresentable>
{
  private readonly _documentService: DocumentService;

  constructor() {
    super(true);
    this._documentService = BlockchainLibraryUtils.getDocumentService();
  }

  async getDocumentsByTransactionIdAndType(
    id: number,
    type: string
  ): Promise<DocumentPresentable[]> {
    // const documentsInfo = await this._documentService.getDocumentsInfoByTransactionIdAndType(id, type);
    // return Promise.all(documentsInfo.map(async (d) => {
    //     const { filename, date, fileUrl, lines } = await this._ipfsService.retrieveJSON(d.externalUrl);
    //     const fileContent = await this._ipfsService.retrieveFile(fileUrl)
    //     // const { filename, date, fileUrl, lines } = await request(`${requestPath.BC_API_BASE_URL}/storages/json/${d.externalUrl}`, {method: 'GET'});
    //     // const fileContent = await request(`${requestPath.BC_API_BASE_URL}/storages/file/${fileUrl}`, {method: 'GET', responseType: 'blob'});
    //     ErrorHandler.manageUndefinedOrEmpty(fileContent, HttpStatusCode.NOT_FOUND, `There is no file related to the document with id: ${d.id}`);
    //     return new DocumentPresentable()
    //         .setId(d.id)
    //         .setName(d.name)
    //         .setContentType(fileContent!.type)
    //         .setDocumentType(d.documentType)
    //         .setContent(fileContent!)
    //         .setFilename(filename)
    //         .setTransactionLines(lines)
    //         .setDate(new Date(date))
    //     })
    // );
    return [];
  }
}
