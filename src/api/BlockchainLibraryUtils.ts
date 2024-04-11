import {
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
    TransformationDriver,
    TransformationService,
} from "@kbc-lib/coffee-trading-management-lib";
import {contractAddresses} from "../constants";
import {getWalletAddress} from "../utils/storage";


export class BlockchainLibraryUtils {

    static getMaterialService = (): MaterialService => {
        const supplyChainDriver = new MaterialDriver(this._getSigner(), contractAddresses.MATERIAL());
        return new MaterialService(supplyChainDriver);
    }
    static getRelationshipService = (): RelationshipService => {
        const relationshipDriver = new RelationshipDriver(this._getSigner(), contractAddresses.RELATIONSHIP());
        return new RelationshipService(relationshipDriver);
    }

    static getTradeManagerService = (): TradeManagerService => {
        const tradeManagerDriver = new TradeManagerDriver(this._getSigner(), contractAddresses.TRADE());
        return new TradeManagerService(tradeManagerDriver);
    }

    static getBasicTradeService = (address: string): BasicTradeService => {
        const basicTradeDriver: BasicTradeDriver = new BasicTradeDriver(this._getSigner(), address);
        return new BasicTradeService(basicTradeDriver)
    }

    static getOrderTradeService = (address: string): OrderTradeService => {
        const orderTradeDriver: OrderTradeDriver = new OrderTradeDriver(this._getSigner(), address);
        return new OrderTradeService(orderTradeDriver)
    }

    static getTransformationService = (): TransformationService => {
        const transformationDriver = new TransformationDriver(this._getSigner(), contractAddresses.TRANSFORMATION());
        return new TransformationService(transformationDriver);
    }

    static getDocumentService = (): DocumentService => {
        const documentDriver = new DocumentDriver(this._getSigner(), contractAddresses.DOCUMENT());
        return new DocumentService(documentDriver);
    }

    static getGraphService = (): GraphService => {
        return new GraphService(BlockchainLibraryUtils.getTradeManagerService(), BlockchainLibraryUtils.getTransformationService(), this._getSigner());
    }

    static getOfferService = (): OfferService => {
        const offerDriver = new OfferDriver(this._getSigner(), contractAddresses.OFFER());
        return new OfferService(offerDriver);
    }

    private static _getSigner = (): Signer => {
        if (!getWalletAddress()) throw new Error("Metamask is not connected");
        return SignerUtils.getSignerFromBrowserProvider(window.ethereum);
    }
}
