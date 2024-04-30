export {};

it('dummy test', () => expect(true).toBeTruthy());

// import {BlockchainLibraryUtils} from "../../../BlockchainLibraryUtils";
// import {getWalletAddress} from "../../../../utils/storage";
// import {BlockchainDocumentStrategy} from "../BlockchainDocumentStrategy";
// import {SolidServerService} from "../../../services/SolidServerService";
// import {DocumentInfo, DocumentType} from "@kbc-lib/coffee-trading-management-lib";
//
// jest.mock("../../../../utils/storage");
// jest.mock("../../../BlockchainLibraryUtils");
// jest.mock("../../../services/SolidServerService");
//
// describe('BlockchainDocumentStrategy', () => {
//     const mockedGetDocumentsInfoByTransactionIdAndType = jest.fn();
//     const mockedRetrieveMetadata = jest.fn();
//     const mockedRetrieveFile = jest.fn();
//
//     const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
//     let blockchainDocumentStrategy: BlockchainDocumentStrategy;
//
//     beforeAll(() => {
//         (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
//         BlockchainLibraryUtils.getDocumentService = jest.fn().mockReturnValue({
//             getDocumentsInfoByTransactionIdAndType: mockedGetDocumentsInfoByTransactionIdAndType,
//         });
//         SolidServerService.prototype.retrieveMetadata = mockedRetrieveMetadata;
//         SolidServerService.prototype.retrieveFile = mockedRetrieveFile;
//         blockchainDocumentStrategy = new BlockchainDocumentStrategy();
//     });
//
//     afterEach(() => jest.clearAllMocks());
//
//     it('should get documents by transaction id and type', async () => {
//         mockedGetDocumentsInfoByTransactionIdAndType.mockReturnValueOnce([
//             new DocumentInfo(1, 2, 'delivery', DocumentType.DELIVERY_NOTE, 'externalUrl'),
//         ]);
//     });
// });
