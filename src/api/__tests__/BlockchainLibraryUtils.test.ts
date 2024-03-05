import {
    AssetOperationDriver, AssetOperationService,
    BasicTradeDriver,
    BasicTradeService, DocumentDriver, DocumentService, GraphService,
    MaterialDriver, MaterialService, OfferDriver, OfferService, OrderTradeDriver, OrderTradeService,
    ProductCategoryDriver,
    ProductCategoryService, RelationshipDriver,
    RelationshipService,
    SignerUtils, TradeDriver, TradeManagerDriver, TradeManagerService, TradeService
} from "@kbc-lib/coffee-trading-management-lib";
import {getWalletAddress} from "../../utils/storage";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";


jest.mock("../../utils/storage");
jest.mock("@kbc-lib/coffee-trading-management-lib");

describe('BlockchainLibraryUtils', () => {
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const contractAddress=   "0x12345678901234567890123456789012345678";

    beforeEach(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        SignerUtils.getSignerFromBrowserProvider = jest.fn();
    });

    it('should throw an error if the wallet address is not set', () => {
        (getWalletAddress as jest.Mock).mockReturnValue(undefined);
        expect(() => BlockchainLibraryUtils.getProductCategoryService()).toThrowError('Metamask is not connected');
    });

    it('should return a ProductCategoryService', () => {
        BlockchainLibraryUtils.getProductCategoryService();

        expect(ProductCategoryDriver).toHaveBeenCalledTimes(1);
        expect(ProductCategoryService).toHaveBeenCalledTimes(1);
    });

    it('should return a MaterialService', () => {
        BlockchainLibraryUtils.getMaterialService();

        expect(MaterialDriver).toHaveBeenCalledTimes(1);
        expect(MaterialService).toHaveBeenCalledTimes(1);
    });

    it('should return a RelationshipService', () => {
        BlockchainLibraryUtils.getRelationshipService();

        expect(RelationshipDriver).toHaveBeenCalledTimes(1);
        expect(RelationshipService).toHaveBeenCalledTimes(1);
    });

    it('should return a TradeManagerService', () => {
        BlockchainLibraryUtils.getTradeManagerService();

        expect(TradeManagerDriver).toHaveBeenCalledTimes(1);
        expect(TradeManagerService).toHaveBeenCalledTimes(1);
    });

    it('should return a TradeService', () => {
        BlockchainLibraryUtils.getTradeService(contractAddress);

        expect(TradeDriver).toHaveBeenCalledTimes(1);
        expect(TradeService).toHaveBeenCalledTimes(1);
    });

    it('should return a BasicTradeService', () => {
        BlockchainLibraryUtils.getBasicTradeService(contractAddress);

        expect(BasicTradeDriver).toHaveBeenCalledTimes(1);
        expect(BasicTradeService).toHaveBeenCalledTimes(1);
    });

    it('should return a OrderTradeService', () => {
        BlockchainLibraryUtils.getOrderTradeService(contractAddress);

        expect(OrderTradeDriver).toHaveBeenCalledTimes(1);
        expect(OrderTradeService).toHaveBeenCalledTimes(1);
    });

    it('should return a AssetOperationService', () => {
        BlockchainLibraryUtils.getAssetOperationService();

        expect(AssetOperationDriver).toHaveBeenCalledTimes(1);
        expect(AssetOperationService).toHaveBeenCalledTimes(1);
    });

    it('should return a DocumentService', () => {
        BlockchainLibraryUtils.getDocumentService();

        expect(DocumentDriver).toHaveBeenCalledTimes(1);
        expect(DocumentService).toHaveBeenCalledTimes(1);
    });

    it('should return an OfferService', () => {
        BlockchainLibraryUtils.getOfferService();

        expect(OfferDriver).toHaveBeenCalledTimes(1);
        expect(OfferService).toHaveBeenCalledTimes(1);
    });

    it('should return a GraphService', () => {
        BlockchainLibraryUtils.getGraphService();

        expect(GraphService).toHaveBeenCalledTimes(1);
    });
});