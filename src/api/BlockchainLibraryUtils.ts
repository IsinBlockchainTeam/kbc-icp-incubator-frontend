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
    AssetOperationService,
    TradeService,
    TradeDriver,
    GraphService,
    ICPFileDriver,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {EnumerableTypeReadDriver, EnumerableTypeService} from "@blockchain-lib/common";
import SingletonSigner from "./SingletonSigner";
import {EnumerableDefinition} from "./services/EthEnumerableTypeService";

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

    static getTradeManagerService = (): TradeManagerService => {
        const tradeManagerDriver: TradeManagerDriver = new TradeManagerDriver(this._getSigner(), contractAddresses.TRADE(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new TradeManagerService({
            tradeManagerDriver: tradeManagerDriver,
            icpFileDriver: ICPFileDriver.getInstance()
        });
    }

    static getTradeService = (tradeContractAddress: string): TradeService => {
        const tradeDriver = new TradeDriver(this._getSigner(), tradeContractAddress);
        const documentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new TradeService(tradeDriver, documentDriver, ICPFileDriver.getInstance());
    }

    static getBasicTradeService = (address: string): BasicTradeService => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        const documentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new BasicTradeService(basicTradeDriver, documentDriver, ICPFileDriver.getInstance());
    }

    static getOrderTradeService = (address: string): OrderTradeService => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address, contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        const documentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new OrderTradeService(orderTradeDriver, documentDriver, ICPFileDriver.getInstance())
    }

    static getAssetOperationService = (): AssetOperationService => {
        const assetOperationDriver: AssetOperationDriver = new AssetOperationDriver(this._getSigner(), contractAddresses.ASSET_OPERATION(), contractAddresses.MATERIAL(), contractAddresses.PRODUCT_CATEGORY());
        return new AssetOperationService(assetOperationDriver);
    }

    static getDocumentService = (): DocumentService => {
        const documentDriver: DocumentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new DocumentService(documentDriver, ICPFileDriver.getInstance());
    }

    static getOfferService = (): OfferService => {
        const offerDriver: OfferDriver = new OfferDriver(this._getSigner(), contractAddresses.OFFER(), contractAddresses.PRODUCT_CATEGORY());
        return new OfferService(offerDriver);
    }

    static getGraphService = (): GraphService => {
        return new GraphService(this._getSigner(), BlockchainLibraryUtils.getTradeManagerService(), BlockchainLibraryUtils.getAssetOperationService());
    }

    static getEnumerableTypeService = (enumDefinition: EnumerableDefinition): EnumerableTypeService => {
        let contractAddress = '';
        switch (enumDefinition) {
            case EnumerableDefinition.PROCESS_TYPE:
                contractAddress = contractAddresses.PROCESS_TYPE();
                break;
            case EnumerableDefinition.UNIT:
                contractAddress = contractAddresses.UNIT();
                break;
            case EnumerableDefinition.FIAT:
                contractAddress = contractAddresses.FIAT();
                break;
            default:
                throw new Error("Enum definition not found");
        }
        const enumerableTypeReadDriver = new EnumerableTypeReadDriver(this._getSigner(), contractAddress);
        return new EnumerableTypeService(enumerableTypeReadDriver);
    }

    private static _getSigner = (): Signer => {
        if (!SingletonSigner.getInstance()) throw new Error("Signer not initialized");
        return SingletonSigner.getInstance()!;
    }
}
