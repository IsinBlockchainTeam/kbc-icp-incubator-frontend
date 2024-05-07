import {
    ProductCategoryDriver,
    ProductCategoryService,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentService,
    MaterialDriver,
    MaterialService,
    OfferDriver,
    OfferService,
    OrderTradeDriver,
    OrderTradeService,
    RelationshipDriver,
    RelationshipService,
    Signer,
    TradeManagerDriver,
    TradeManagerService,
    AssetOperationDriver,
    AssetOperationService, TradeService, TradeDriver, GraphService,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {SolidDocumentSpec, SolidMetadataSpec} from "@kbc-lib/coffee-trading-management-lib";
import {SolidSpec} from "./types/storage";
import {EnumerableTypeReadDriver, EnumerableTypeService, SolidStorageACR} from "@blockchain-lib/common";
import SingletonSigner from "./SingletonSigner";

export class BlockchainLibraryUtils {
    static waitForTransactions = async (transactionHash: string, confirmations: number): Promise<void> => {
        if(this._getSigner()) {
            await this._getSigner().provider?.waitForTransaction(transactionHash, confirmations);
        }
    }

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

    static getTradeManagerService = (storage?: SolidSpec): TradeManagerService<SolidMetadataSpec, SolidStorageACR> => {
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(this._getSigner(), contractAddresses.TRADE(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new TradeManagerService(tradeManagerDriver);
    }

    static getTradeService = (tradeContractAddress: string): TradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const tradeDriver = new TradeDriver(this._getSigner(), tradeContractAddress);
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new TradeService({tradeDriver, documentDriver});
    }

    static getBasicTradeService = (address: string): BasicTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new BasicTradeService({tradeDriver: basicTradeDriver});
    }

    static getOrderTradeService = (address: string): OrderTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new OrderTradeService({tradeDriver: orderTradeDriver})
    }

    static getAssetOperationService = (): AssetOperationService => {
        const assetOperationDriver: AssetOperationDriver = new AssetOperationDriver(this._getSigner(), contractAddresses.ASSET_OPERATION(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new AssetOperationService(assetOperationDriver);
    }

    static getDocumentService = (): DocumentService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new DocumentService({documentDriver});
    }

    static getOfferService = (): OfferService => {
        const offerDriver: OfferDriver = new OfferDriver(this._getSigner(), contractAddresses.OFFER(), contractAddresses.PRODUCT_CATEGORY());
        return new OfferService(offerDriver);
    }

    static getGraphService = (): GraphService<SolidMetadataSpec, SolidStorageACR> => {
        return new GraphService(this._getSigner(), BlockchainLibraryUtils.getTradeManagerService(), BlockchainLibraryUtils.getAssetOperationService());
    }

    static getEnumerableTypeService = (): EnumerableTypeService => {
        const enumerableTypeReadDriver = new EnumerableTypeReadDriver(this._getSigner(), contractAddresses.PROCESS_TYPE());
        return new EnumerableTypeService(enumerableTypeReadDriver);
    }

    private static _getSigner = (): Signer => {
        if (!SingletonSigner.getInstance()) throw new Error("Metamask is not connected");
        return SingletonSigner.getInstance()!;
    }
}
