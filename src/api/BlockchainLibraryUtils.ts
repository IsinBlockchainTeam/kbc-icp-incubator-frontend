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
    SignerUtils,
    TradeManagerDriver,
    TradeManagerService,
    AssetOperationDriver,
    AssetOperationService,
    TradeService,
    TradeDriver,
    SolidMetadataDriver,
    GraphService,
    SolidDocumentDriver,
    ICPMetadataDriver,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {getWalletAddress} from "../utils/storage";
import {SolidDocumentSpec, SolidMetadataSpec} from "@kbc-lib/coffee-trading-management-lib";
import {SolidSpec} from "./types/storage";
import {SolidStorageACR} from "@blockchain-lib/common";

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

    static getTradeManagerService = (storage?: SolidSpec): TradeManagerService => {
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(this._getSigner(), contractAddresses.TRADE(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        // const {storageMetadataDriver} = this.defineStorageDrivers(storage);
        // return new TradeManagerService(tradeManagerDriver, storageMetadataDriver);
        return new TradeManagerService(tradeManagerDriver, ICPMetadataDriver.getInstance());
    }

    static getTradeService = (tradeContractAddress: string, storage?: SolidSpec): TradeService => {
        const tradeDriver = new TradeDriver(this._getSigner(), tradeContractAddress);
        return new TradeService(tradeDriver, ICPMetadataDriver.getInstance());
    }

    static getBasicTradeService = (address: string, storage?: SolidSpec): BasicTradeService => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new BasicTradeService(basicTradeDriver, ICPMetadataDriver.getInstance());
    }

    static getOrderTradeService = (address: string, storage?: SolidSpec): OrderTradeService => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        console.log('returning order trade service');
        return new OrderTradeService(orderTradeDriver, ICPMetadataDriver.getInstance())
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

    static getGraphService = (): GraphService => {
        return new GraphService(this._getSigner(), BlockchainLibraryUtils.getTradeManagerService(), BlockchainLibraryUtils.getAssetOperationService());
    }

    private static defineStorageDrivers = (storage?: SolidSpec) => {
        let storageMetadataDriver, storageDocumentDriver;
        if (storage) {
            storageMetadataDriver = new SolidMetadataDriver(storage.serverUrl, storage.sessionCredentials);
            storageDocumentDriver = new SolidDocumentDriver(storage.serverUrl, storage.sessionCredentials);
        }
        return {storageMetadataDriver, storageDocumentDriver};
    }

    private static _getSigner = (): Signer => {
        if (!getWalletAddress()) throw new Error("Metamask is not connected");
        return SignerUtils.getSignerFromBrowserProvider(window.ethereum);
    }
}
