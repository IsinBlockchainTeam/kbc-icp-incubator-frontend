import { contractAddresses } from '../constants';
import { EnumerableTypeReadDriver, EnumerableTypeService } from '@blockchain-lib/common';
import { SignerContext } from '@/providers/SignerProvider';
import { useContext } from 'react';
import {
    AssetOperationDriver,
    AssetOperationService,
    BasicTradeDriver,
    BasicTradeService,
    DocumentDriver,
    DocumentService,
    GraphService,
    ICPFileDriver,
    MaterialDriver,
    MaterialService,
    OfferDriver,
    OfferService,
    OrderTradeDriver,
    OrderTradeService,
    ProductCategoryDriver,
    ProductCategoryService,
    RelationshipDriver,
    RelationshipService,
    TradeDriver,
    TradeManagerDriver,
    TradeManagerService,
    TradeService
} from '@kbc-lib/coffee-trading-management-lib';

export enum EnumerableDefinition {
    PROCESS_TYPE,
    UNIT,
    FIAT
}

export function useBlockchainLibraryUtils(fileDriver: ICPFileDriver) {
    const { signer } = useContext(SignerContext);

    async function waitForTransactions(
        transactionHash: string,
        confirmations: number
    ): Promise<void> {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        await signer.provider.waitForTransaction(transactionHash, confirmations);
    }

    function getProductCategoryService(): ProductCategoryService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const supplyChainDriver = new ProductCategoryDriver(
            signer,
            contractAddresses.PRODUCT_CATEGORY()
        );
        return new ProductCategoryService(supplyChainDriver);
    }

    function getMaterialService(): MaterialService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const supplyChainDriver = new MaterialDriver(
            signer,
            contractAddresses.MATERIAL(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        return new MaterialService(supplyChainDriver);
    }

    function getRelationshipService(): RelationshipService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const relationshipDriver = new RelationshipDriver(signer, contractAddresses.RELATIONSHIP());
        return new RelationshipService(relationshipDriver);
    }

    function getTradeManagerService(): TradeManagerService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const tradeManagerDriver = new TradeManagerDriver(
            signer,
            contractAddresses.TRADE(),
            contractAddresses.MATERIAL(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        return new TradeManagerService({
            tradeManagerDriver: tradeManagerDriver,
            icpFileDriver: fileDriver
        });
    }

    function getTradeService(tradeContractAddress: string): TradeService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const tradeDriver = new TradeDriver(signer, tradeContractAddress);
        const documentDriver = new DocumentDriver(signer, contractAddresses.DOCUMENT());
        return new TradeService(tradeDriver, documentDriver, fileDriver);
    }

    function getBasicTradeService(address: string): BasicTradeService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const basicTradeDriver = new BasicTradeDriver(
            signer,
            address,
            contractAddresses.MATERIAL(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        const documentDriver = new DocumentDriver(signer, contractAddresses.DOCUMENT());
        return new BasicTradeService(basicTradeDriver, documentDriver, fileDriver);
    }

    function getOrderTradeService(address: string): OrderTradeService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const orderTradeDriver = new OrderTradeDriver(
            signer,
            address,
            contractAddresses.MATERIAL(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        const documentDriver = new DocumentDriver(signer, contractAddresses.DOCUMENT());
        return new OrderTradeService(orderTradeDriver, documentDriver, fileDriver);
    }

    function getAssetOperationService(): AssetOperationService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const assetOperationDriver = new AssetOperationDriver(
            signer,
            contractAddresses.ASSET_OPERATION(),
            contractAddresses.MATERIAL(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        return new AssetOperationService(assetOperationDriver);
    }

    function getDocumentService(): DocumentService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const documentDriver = new DocumentDriver(signer, contractAddresses.DOCUMENT());
        return new DocumentService(documentDriver, fileDriver);
    }

    function getOfferService(): OfferService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        const offerDriver = new OfferDriver(
            signer,
            contractAddresses.OFFER(),
            contractAddresses.PRODUCT_CATEGORY()
        );
        return new OfferService(offerDriver);
    }

    function getGraphService(): GraphService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
        return new GraphService(signer, getTradeManagerService(), getAssetOperationService());
    }

    function getEnumerableTypeService(enumDefinition: EnumerableDefinition): EnumerableTypeService {
        if (!signer) {
            throw new Error('Signer not initialized');
        }
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
                throw new Error('Enum definition not found');
        }
        const enumerableTypeReadDriver = new EnumerableTypeReadDriver(signer, contractAddress);
        return new EnumerableTypeService(enumerableTypeReadDriver);
    }

    return {
        waitForTransactions,
        getProductCategoryService,
        getMaterialService,
        getRelationshipService,
        getTradeManagerService,
        getTradeService,
        getBasicTradeService,
        getOrderTradeService,
        getAssetOperationService,
        getDocumentService,
        getOfferService,
        getGraphService,
        getEnumerableTypeService
    };
}
