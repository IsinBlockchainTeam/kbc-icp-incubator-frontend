import { useSigner } from '@/providers/SignerProvider';
import {
    AssetOperationDriver,
    AssetOperationService,
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
    ProductCategoryDriver,
    ProductCategoryService,
    RelationshipDriver,
    RelationshipService,
    TradeDriver,
    TradeManagerDriver,
    TradeManagerService,
    TradeService
} from '@kbc-lib/coffee-trading-management-lib';
import { EnumerableTypeReadDriver, EnumerableTypeService } from '@blockchain-lib/common';
import { contractAddresses } from '@/constants/evm';
import {
    EthAssetOperationService,
    EthDocumentService,
    EthEnumerableTypeService,
    EthGraphService,
    EthMaterialService,
    EthOfferService,
    EthPartnerService,
    EthTradeService
} from '@/api/services';
import { useICP } from '@/providers/ICPProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export function useEthServices() {
    const { signer } = useSigner();
    const { fileDriver, getNameByDID } = useICP();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const productCategoryDriver = new ProductCategoryDriver(
        signer,
        contractAddresses.PRODUCT_CATEGORY()
    );
    const materialDriver = new MaterialDriver(
        signer,
        contractAddresses.MATERIAL(),
        contractAddresses.PRODUCT_CATEGORY()
    );
    const relationshipDriver = new RelationshipDriver(signer, contractAddresses.RELATIONSHIP());
    const tradeManagerDriver = new TradeManagerDriver(
        signer,
        contractAddresses.TRADE(),
        contractAddresses.MATERIAL(),
        contractAddresses.PRODUCT_CATEGORY()
    );
    const documentDriver = new DocumentDriver(signer, contractAddresses.DOCUMENT());
    const assetOperationDriver = new AssetOperationDriver(
        signer,
        contractAddresses.ASSET_OPERATION(),
        contractAddresses.MATERIAL(),
        contractAddresses.PRODUCT_CATEGORY()
    );
    const offerDriver = new OfferDriver(
        signer,
        contractAddresses.OFFER(),
        contractAddresses.PRODUCT_CATEGORY()
    );

    const productCategoryService = new ProductCategoryService(productCategoryDriver);
    const materialService = new MaterialService(materialDriver);
    const relationshipService = new RelationshipService(relationshipDriver);
    const tradeManagerService = new TradeManagerService({
        tradeManagerDriver: tradeManagerDriver,
        icpFileDriver: fileDriver
    });
    const assetOperationService = new AssetOperationService(assetOperationDriver);
    const documentService = new DocumentService(documentDriver, fileDriver);
    const graphService = new GraphService(signer, tradeManagerService, assetOperationService);
    const offerService = new OfferService(offerDriver);
    const fiatService = new EnumerableTypeService(
        new EnumerableTypeReadDriver(signer, contractAddresses.FIAT())
    );
    const processTypeService = new EnumerableTypeService(
        new EnumerableTypeReadDriver(signer, contractAddresses.PROCESS_TYPE())
    );
    const unitService = new EnumerableTypeService(
        new EnumerableTypeReadDriver(signer, contractAddresses.UNIT())
    );

    const getTradeService = (address: string) =>
        new TradeService(new TradeDriver(signer, address), documentDriver, fileDriver);
    const getBasicTradeService = (address: string) =>
        new BasicTradeService(
            new BasicTradeDriver(
                signer,
                address,
                contractAddresses.MATERIAL(),
                contractAddresses.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );
    const getOrderTradeService = (address: string) =>
        new OrderTradeService(
            new OrderTradeDriver(
                signer,
                address,
                contractAddresses.MATERIAL(),
                contractAddresses.PRODUCT_CATEGORY()
            ),
            documentDriver,
            fileDriver
        );
    async function waitForTransactions(transactionHash: string, confirmations: number) {
        await signer.provider.waitForTransaction(transactionHash, confirmations);
    }

    const ethAssetOperationService = new EthAssetOperationService(
        signer.address,
        assetOperationService,
        materialService
    );
    const ethDocumentService = new EthDocumentService(
        documentService,
        tradeManagerService,
        getTradeService
    );

    const ethProcessTypeService = new EthEnumerableTypeService(processTypeService);
    const ethUnitService = new EthEnumerableTypeService(unitService);
    const ethFiatService = new EthEnumerableTypeService(fiatService);
    const ethGraphService = new EthGraphService(graphService);
    const ethMaterialService = new EthMaterialService(
        signer.address,
        productCategoryService,
        materialService
    );
    const ethOfferService = new EthOfferService(offerService);
    const ethPartnerService = new EthPartnerService(signer.address, relationshipService);
    const ethTradeService = new EthTradeService(
        signer.address,
        parseInt(userInfo.organizationId),
        ethMaterialService,
        tradeManagerService,
        ethDocumentService,
        getTradeService,
        getBasicTradeService,
        getOrderTradeService,
        waitForTransactions,
        getNameByDID
    );

    return {
        ethAssetOperationService,
        ethDocumentService,
        ethProcessTypeService,
        ethUnitService,
        ethFiatService,
        ethGraphService,
        ethMaterialService,
        ethOfferService,
        ethPartnerService,
        ethTradeService
    };
}
