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
    AssetOperationService, TradeService, TradeDriver, SolidMetadataDriver, GraphService, SolidDocumentDriver,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {SolidDocumentSpec, SolidMetadataSpec} from "@kbc-lib/coffee-trading-management-lib";
import {SolidSpec} from "./types/storage";
import {EnumerableTypeReadDriver, EnumerableTypeService, SolidStorageACR} from "@blockchain-lib/common";
import SingletonSigner from "./SingletonSigner";

export class BlockchainLibraryUtils {

    static getProductCategoryService = (): ProductCategoryService => {
        // const supplyChainDriver: ProductCategoryDriver = new ProductCategoryDriver(this._getSigner(), contractAddresses.PRODUCT_CATEGORY());
        const supplyChainDriver: ProductCategoryDriver = new ProductCategoryDriver(this._getSigner(), "0x0bC5C7C43356A69EA9f75f855eD2B8163632799a");
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
        const {storageMetadataDriver} = this.defineStorageDrivers(storage);
        return new TradeManagerService(tradeManagerDriver, storageMetadataDriver);
    }

    static getTradeService = (tradeContractAddress: string, storage?: SolidSpec): TradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const tradeDriver = new TradeDriver(this._getSigner(), tradeContractAddress);
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        const {storageMetadataDriver, storageDocumentDriver} = this.defineStorageDrivers(storage);
        return new TradeService({tradeDriver, documentDriver, storageMetadataDriver, storageDocumentDriver});
    }

    static getBasicTradeService = (address: string, storage?: SolidSpec): BasicTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        const {storageMetadataDriver, storageDocumentDriver} = this.defineStorageDrivers(storage);
        return new BasicTradeService({tradeDriver: basicTradeDriver, storageMetadataDriver, storageDocumentDriver});
    }

    static getOrderTradeService = (address: string, storage?: SolidSpec): OrderTradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        const {storageMetadataDriver, storageDocumentDriver} = this.defineStorageDrivers(storage);
        return new OrderTradeService({tradeDriver: orderTradeDriver, storageMetadataDriver, storageDocumentDriver})
    }

    static getAssetOperationService = (): AssetOperationService => {
        const assetOperationDriver: AssetOperationDriver = new AssetOperationDriver(this._getSigner(), contractAddresses.ASSET_OPERATION(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new AssetOperationService(assetOperationDriver);
    }

    static getDocumentService = (storage?: SolidSpec): DocumentService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR> => {
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        const {storageMetadataDriver, storageDocumentDriver} = this.defineStorageDrivers(storage);
        return new DocumentService({documentDriver, storageMetadataDriver, storageDocumentDriver});
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

    private static defineStorageDrivers = (storage?: SolidSpec) => {
        let storageMetadataDriver, storageDocumentDriver;
        if (storage) {
            storageMetadataDriver = new SolidMetadataDriver(storage.serverUrl, storage.sessionCredentials);
            storageDocumentDriver = new SolidDocumentDriver(storage.serverUrl, storage.sessionCredentials);
        }
        return {storageMetadataDriver, storageDocumentDriver};
    }

    private static  _getSigner = (): Signer => {
        const signer = SingletonSigner.getSigner();
        if (!signer) throw new Error("Metamask is not connected");
        return signer;
    }
}
