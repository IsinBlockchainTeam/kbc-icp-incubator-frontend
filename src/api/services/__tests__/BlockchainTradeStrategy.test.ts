import {BlockchainTradeStrategy} from "../../strategies/trade/BlockchainTradeStrategy";
import {getWalletAddress} from "../../../../utils/storage";
import {UseBlockchainLibraryUtils} from "../../../hooks/useBlockchainLibraryUtils";
import {
    Line, LineRequest,
    Material, OrderLinePrice, OrderLineRequest,
    ProductCategory,
    OrderStatus,
    TradeType
} from "../coffee-trading-management-lib/src/index";
import {TradePreviewPresentable} from "../../types/TradePresentable";
import {TradeLinePresentable, TradeLinePrice} from "../../types/TradeLinePresentable";
import {MaterialPresentable} from "../../types/MaterialPresentable";
import {CustomError} from "../../../utils/error/CustomError";
import {HttpStatusCode} from "../../../utils/error/HttpStatusCode";

jest.mock('../../../BlockchainLibraryUtils');

jest.mock('../../../services/SolidServerService', () => ({
    SolidServerService: jest.fn().mockReturnValue({
        retrieveMetadata: jest.fn(),
    }),
}));

jest.mock('../../../../utils/utils', () => ({
    ...jest.requireActual('../../../../utils/utils'),
    checkAndGetEnvironmentVariable: jest.fn(),
}));

jest.mock('../../../../utils/storage');

describe('BlockchainTradeStrategy', () => {
    const mockGetGeneralTrades = jest.fn();
    const mockGetTradeIdsOfSupplier = jest.fn();
    const mockGetTradeIdsOfCommissioner = jest.fn();
    const mockGetTradeAddress = jest.fn();

    const mockGetTradeType = jest.fn();
    const mockGetBasicLines = jest.fn();
    const mockGetOrderLines = jest.fn();
    const mockGetBasicTrade = jest.fn();
    const mockGetOrderTrade = jest.fn();
    const mockRegisterBasicTrade = jest.fn();
    const mockRegisterOrderTrade = jest.fn();
    const mockAddBasicLine = jest.fn();
    const mockAddOrderLine = jest.fn();
    const mockgetOrderStatus = jest.fn();
    const mockSetName = jest.fn();

    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const basicTrade: TradePreviewPresentable = new TradePreviewPresentable(1, [new TradeLinePresentable(1, new MaterialPresentable(1, 'product category'))], 'supplier1', TradeType.BASIC)
        .setCustomer('customer1');
    const orderTrade: TradePreviewPresentable = new TradePreviewPresentable(1, [
        new TradeLinePresentable(1, new MaterialPresentable(1, 'product category'))
            .setQuantity(10)
            .setPrice(new TradeLinePrice(100.25, 'USD'))
    ], 'supplier1', TradeType.ORDER)
        .setCustomer('customer1')
        .setCommissioner('commissioner1')
        .setPaymentDeadline(new Date(100))
        .setDocumentDeliveryDeadline(new Date(200))
        .setArbiter('arbiter1')
        .setShippingDeadline(new Date(300))
        .setDeliveryDeadline(new Date(400))
        .setAgreedAmount(10)
        .setTokenAddress('tokenAddress1')
    let blockchainTradeStrategy: BlockchainTradeStrategy;

    beforeEach(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        UseBlockchainLibraryUtils.getTradeManagerService = jest.fn().mockReturnValue({
            registerBasicTrade: mockRegisterBasicTrade,
            registerOrderTrade: mockRegisterOrderTrade,
            getGeneralTrades: mockGetGeneralTrades,
            getTradeIdsOfSupplier: mockGetTradeIdsOfSupplier,
            getTradeIdsOfCommissioner: mockGetTradeIdsOfCommissioner,
            getTrade: mockGetTradeAddress,
        });
        UseBlockchainLibraryUtils.getTradeService = jest.fn().mockReturnValue({
            getTradeType: mockGetTradeType,
        });
        UseBlockchainLibraryUtils.getBasicTradeService = jest.fn().mockReturnValue({
            addLine: mockAddBasicLine,
            getTrade: mockGetBasicTrade,
            getLines: mockGetBasicLines,
            getOrderStatus: mockgetOrderStatus,
            setName: mockSetName,
        });
        UseBlockchainLibraryUtils.getOrderTradeService = jest.fn().mockReturnValue({
            addLine: mockAddOrderLine,
            getTrade: mockGetOrderTrade,
            getLines: mockGetOrderLines,
        });
        blockchainTradeStrategy = new BlockchainTradeStrategy({
            serverUrl: 'serverUrl',
            sessionCredentials: {
                podName: 'podName',
                clientId: 'clientId',
                clientSecret: 'clientSecret',
            }
        });
    });

    afterEach(() => jest.clearAllMocks());

    it('should get general trades', async () => {
        mockGetTradeIdsOfSupplier.mockReturnValue([1]);
        mockGetTradeIdsOfCommissioner.mockReturnValue([2]);
        mockGetTradeAddress.mockReturnValueOnce('0x123');
        mockGetTradeAddress.mockReturnValueOnce('0x456');
        mockGetTradeType.mockReturnValueOnce(TradeType.BASIC);
        mockGetTradeType.mockReturnValueOnce(TradeType.ORDER);

        const firstProductCategory = new ProductCategory(1, 'first product category', 1, 'description');
        const secondProductCategory = new ProductCategory(2, 'second product category', 2, 'description');
        mockGetBasicLines.mockReturnValue([new Line(1, new Material(1, firstProductCategory), firstProductCategory)]);
        mockGetOrderLines.mockReturnValue([new Line(2, new Material(2, secondProductCategory), secondProductCategory)]);
        mockGetBasicTrade.mockReturnValue({
            tradeId: 1,
            supplier: 'supplier1',
            customer: 'customer1',
            commissioner: 'commissioner1',
        });
        mockGetOrderTrade.mockReturnValue({
            tradeId: 2,
            supplier: 'supplier2',
            customer: 'customer2',
            commissioner: 'commissioner2',
        });

        const result = await blockchainTradeStrategy.getGeneralTrades();
        expect(result).toEqual([
            new TradePreviewPresentable(1, [new TradeLinePresentable(1, new MaterialPresentable(1, 'first product category'))], 'supplier1', TradeType.BASIC).setCustomer('customer1').setCommissioner('commissioner1'),
            new TradePreviewPresentable(2, [new TradeLinePresentable(2, new MaterialPresentable(2, 'second product category'))], 'supplier2', TradeType.ORDER).setCustomer('customer2').setCommissioner('commissioner2'),
        ]);
    });

    it('should handle error when getting general trades', async () => {
        mockGetTradeIdsOfSupplier.mockReturnValue([1]);
        mockGetTradeIdsOfCommissioner.mockReturnValue([]);
        mockGetTradeAddress.mockReturnValueOnce('0x123');
        mockGetTradeType.mockReturnValueOnce(42);

        await expect(async () => await blockchainTradeStrategy.getGeneralTrades()).rejects.toThrowError(new CustomError(HttpStatusCode.INTERNAL_SERVER, "Received an invalid trade type"));
    });

    it('should get trade by id and type - CASE BASIC', async () => {
        mockGetTradeAddress.mockReturnValueOnce('0x123');
        mockGetBasicTrade.mockReturnValue({
            tradeId: 1,
            name: 'test trade',
            supplier: 'supplier1',
            customer: 'customer1',
        });
        const productCategory = new ProductCategory(1, 'product category', 1, 'description');
        mockGetBasicLines.mockReturnValue(
            [new Line(1, new Material(1, productCategory), productCategory)]
        );
        mockgetOrderStatus.mockReturnValue(OrderStatus.ON_BOARD);

        const result = await blockchainTradeStrategy.getTradeByIdAndType(1, TradeType.BASIC);
        expect(result).toEqual(new TradePreviewPresentable(1, [new TradeLinePresentable(1, new MaterialPresentable(1, 'product category'))], 'supplier1', TradeType.BASIC).setCustomer('customer1').setName('test trade').setStatus(OrderStatus.ON_BOARD));
    });

    // it('should get trade by id and type - CASE ORDER', async () => {
    //     mockGetTradeAddress.mockReturnValueOnce('0x123');
    //     mockGetOrderTrade.mockReturnValue({
    //         tradeId: 1,
    //         supplier: 'supplier1',
    //         customer: 'customer1',
    //         commissioner: 'commissioner1',
    //         paymentDeadline: 100,
    //         documentDeliveryDeadline: 200,
    //         arbiter: 'arbiter1',
    //         shippingDeadline: 300,
    //         deliveryDeadline: 400,
    //         escrow: 'escrow1',
    //     });
    //     mockRetrieveMetadata.mockReturnValue({
    //         incoterms: 'FOB',
    //         shipper: 'shipper1',
    //         shippingPort: 'shippingPort1',
    //         deliveryPort: 'deliveryPort1',
    //     });
    //     const productCategory = new ProductCategory(1, 'product category', 1, 'description');
    //     mockGetOrderLines.mockReturnValue([
    //         new OrderLine(1, new Material(1, productCategory), productCategory, 10, new OrderLinePrice(100.25, 'USD')),
    //     ]);
    //
    //     const result = await blockchainTradeStrategy.getTradeByIdAndType(1, TradeType.ORDER);
    //     expect(result).toEqual(
    //         new TradePresentable(1,
    //             [
    //                 new TradeLinePresentable(1, new MaterialPresentable(1, 'product category'))
    //                     .setQuantity(10)
    //                     .setPrice(new TradeLinePrice(100.25, 'USD'))
    //             ],
    //             'supplier1', TradeType.ORDER
    //         )
    //             .setCustomer('customer1')
    //             .setCommissioner('commissioner1')
    //             .setPaymentDeadline(new Date(100))
    //             .setDocumentDeliveryPipeline(new Date(200))
    //             .setArbiter('arbiter1')
    //             .setShippingDeadline(new Date(300))
    //             .setDeliveryDeadline(new Date(400))
    //             .setEscrow('escrow1')
    //             .setIncoterms('FOB')
    //             .setShipper('shipper1')
    //             .setShippingPort('shippingPort1')
    //             .setDeliveryPort('deliveryPort1')
    //     );
    // });

    it('should throw error when registering a trade with an invalid type', async () => {
        mockGetTradeAddress.mockReturnValueOnce('0x123');
        await expect(async () => await blockchainTradeStrategy.getTradeByIdAndType(1, 42)).rejects.toThrowError(new CustomError(HttpStatusCode.BAD_REQUEST, "Wrong trade type"));
    });

    it('should save a basic trade', async () => {
        mockRegisterBasicTrade.mockReturnValue(1);
        await blockchainTradeStrategy.saveBasicTrade(basicTrade);

        expect(mockRegisterBasicTrade).toHaveBeenCalledTimes(1);
        expect(mockRegisterBasicTrade).toHaveBeenNthCalledWith(1, basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, 'externalUrl', basicTrade.name);
        expect(mockGetTradeAddress).toHaveBeenCalledTimes(1);
        expect(mockAddBasicLine).toHaveBeenCalledTimes(1);
        expect(mockAddBasicLine).toHaveBeenNthCalledWith(1, new LineRequest(1));
    });

    it('should update a basic trade', async () => {
        mockGetTradeAddress.mockReturnValue('0x123');
        mockGetBasicTrade.mockReturnValue(basicTrade);
        const updatedTrade = {
            ...basicTrade,
            name: 'updated trade',
        } as unknown as TradePreviewPresentable;
        await blockchainTradeStrategy.putBasicTrade(basicTrade.id, updatedTrade);

        expect(mockSetName).toHaveBeenCalledTimes(1);
        expect(mockSetName).toHaveBeenNthCalledWith(1, 'updated trade');
    });

    it('should save an order trade', async () => {
        mockRegisterOrderTrade.mockReturnValue(1);
        await blockchainTradeStrategy.saveOrderTrade(orderTrade);

        expect(mockRegisterOrderTrade).toHaveBeenCalledTimes(1);
        expect(mockRegisterOrderTrade).toHaveBeenNthCalledWith(1, orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, 'externalUrl', 100, 200, orderTrade.arbiter, 300, 400, 10, 'tokenAddress1');
        expect(mockGetTradeAddress).toHaveBeenCalledTimes(1);
        expect(mockAddOrderLine).toHaveBeenCalledTimes(1);
        expect(mockAddOrderLine).toHaveBeenNthCalledWith(1, new OrderLineRequest(1, 10, new OrderLinePrice(100.25, 'USD')));
    });
});
