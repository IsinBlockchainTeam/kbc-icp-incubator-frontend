import {
    ProductCategoryDriver,
    ProductCategoryService,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentService,
    GraphService,
    MaterialDriver,
    MaterialService,
    OfferDriver,
    OfferService,
    OrderTradeDriver,
    OrderTradeService,
    RelationshipDriver,
    RelationshipService,
    Signer,
    SignerUtils,
    TradeManagerDriver,
    TradeManagerService,
    AssetOperationDriver,
    AssetOperationService, TradeService, TradeDriver,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {getWalletAddress} from "../utils/storage";


export class BlockchainLibraryUtils {

    static getProductCategoryService = (): ProductCategoryService => {
        const supplyChainDriver: ProductCategoryDriver = new ProductCategoryDriver(this._getSigner(), contractAddresses.PRODUCT_CATEGORY());
        return new ProductCategoryService(supplyChainDriver);
    }

    static getMaterialService = (): MaterialService => {
        const supplyChainDriver: MaterialDriver = new MaterialDriver(this._getSigner(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new MaterialService(supplyChainDriver);
    }
    static getRelationshipService = (): RelationshipService => {
        const relationshipDriver: RelationshipDriver = new RelationshipDriver(this._getSigner(), contractAddresses.RELATIONSHIP());
        return new RelationshipService(relationshipDriver);
    }

    static getTradeManagerService = (): TradeManagerService => {
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(this._getSigner(), contractAddresses.TRADE(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new TradeManagerService(tradeManagerDriver);
    }

    static getTradeService = (tradeContractAddress: string): TradeService => {
        const tradeDriver = new TradeDriver(this._getSigner(), tradeContractAddress);
        return new TradeService(tradeDriver);
    }

    static getBasicTradeService = (address: string): BasicTradeService => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new BasicTradeService(basicTradeDriver)
    }

    static getOrderTradeService = (address: string): OrderTradeService => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new OrderTradeService(orderTradeDriver)
    }

    static getAssetOperationService = (): AssetOperationService => {
        const assetOperationDriver: AssetOperationDriver = new AssetOperationDriver(this._getSigner(), contractAddresses.ASSET_OPERATION(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new AssetOperationService(assetOperationDriver);
    }

    static getDocumentService = (): DocumentService => {
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new DocumentService(documentDriver);
    }

    static getOfferService = (): OfferService => {
        const offerDriver: OfferDriver = new OfferDriver(this._getSigner(), contractAddresses.OFFER(), contractAddresses.PRODUCT_CATEGORY());
        return new OfferService(offerDriver);
    }

    static getGraphService = (): GraphService => {
        return new GraphService(this._getSigner(), BlockchainLibraryUtils.getTradeManagerService(), BlockchainLibraryUtils.getAssetOperationService());
    }

    private static _getSigner = (): Signer => {
        if (!getWalletAddress()) throw new Error("Metamask is not connected");
        return SignerUtils.getSignerFromBrowserProvider(window.ethereum);
    }
}
