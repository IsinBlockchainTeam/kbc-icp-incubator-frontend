import { EthTradeService } from '@/api/services/EthTradeService';
import {
    BasicTradeService,
    DocumentService,
    DocumentStatus,
    MaterialService,
    NegotiationStatus,
    OrderStatus,
    OrderTrade,
    OrderTradeService,
    ProductCategoryService,
    Trade,
    TradeManagerService,
    TradeManagerServiceArgs,
    TradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { DocumentInfoPresentable } from '@/api/types/DocumentPresentable';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthTradeService', () => {
    let ethTradeService: EthTradeService;
    let ethMaterialService: EthMaterialService;
    let tradeManagerService: TradeManagerService;
    let ethDocumentService: EthDocumentService;
    let getTradeService = jest.fn();
    let getBasicTradeService = jest.fn();
    let getOrderTradeService = jest.fn();
    let waitForTransactions = jest.fn();
    let getNameByDID = jest.fn();

    beforeEach(() => {
        ethMaterialService = new EthMaterialService(
            'walletAddress',
            {} as ProductCategoryService,
            {} as MaterialService
        );
        tradeManagerService = new TradeManagerService({} as TradeManagerServiceArgs);
        ethDocumentService = new EthDocumentService(
            {} as DocumentService,
            {} as TradeManagerService,
            getTradeService
        );
        ethTradeService = new EthTradeService(
            'walletAddress',
            0,
            ethMaterialService,
            tradeManagerService,
            ethDocumentService,
            getTradeService,
            getBasicTradeService,
            getOrderTradeService,
            waitForTransactions,
            getNameByDID
        );
    });

    describe('getGeneralTrades', () => {
        it('should return empty array when there are no trade IDs', async () => {
            tradeManagerService.getTradeIdsOfSupplier = jest.fn().mockResolvedValue([]);
            tradeManagerService.getTradeIdsOfCommissioner = jest.fn().mockResolvedValue([]);

            const result = await ethTradeService.getGeneralTrades();
            expect(result).toEqual([]);
        });

        it('should return trade presentables - TradeType.BASIC', async () => {
            const trade = {
                tradeId: 1,
                supplier: 'supplier',
                commissioner: 'commissioner'
            } as Trade;
            const tradeService = {
                getTradeType: jest.fn().mockResolvedValue(TradeType.BASIC)
            } as unknown as TradeService;
            const tradeInstanceService = {
                getTrade: jest.fn().mockResolvedValue(trade)
            } as unknown as BasicTradeService;

            tradeManagerService.getTradeIdsOfSupplier = jest.fn().mockResolvedValue([1]);
            tradeManagerService.getTradeIdsOfCommissioner = jest.fn().mockResolvedValue([]);
            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getTradeService.mockReturnValue(tradeService);
            getBasicTradeService.mockReturnValue(tradeInstanceService);
            getNameByDID.mockResolvedValue('name');

            const result = await ethTradeService.getGeneralTrades();
            expect(result).toEqual([
                {
                    id: 1,
                    supplier: 'name',
                    commissioner: 'name',
                    type: TradeType.BASIC,
                    actionRequired: undefined,
                    negotiationStatus: undefined,
                    orderStatus: undefined
                }
            ]);

            expect(getTradeService).toHaveBeenCalledWith('tradeAddress');
            expect(tradeService.getTradeType).toHaveBeenCalled();
        });

        it.each([
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.PRODUCTION,
                signatures: ['supplier'],
                documentInfo: [],
                expectedActionMessage: 'This negotiation needs your sign to proceed'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.PRODUCTION,
                signatures: ['walletAddress'],
                documentInfo: [],
                expectedActionMessage: 'You have to upload some documents'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.PRODUCTION,
                signatures: ['walletAddress'],
                documentInfo: [
                    {
                        status: DocumentStatus.NOT_APPROVED
                    } as DocumentInfoPresentable
                ],
                expectedActionMessage: 'You have to upload some documents'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.PAYED,
                signatures: ['walletAddress'],
                documentInfo: [
                    {
                        status: DocumentStatus.NOT_APPROVED
                    } as DocumentInfoPresentable
                ],
                expectedActionMessage: 'You have to upload some documents'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.EXPORTED,
                signatures: ['walletAddress'],
                documentInfo: [
                    {
                        status: DocumentStatus.NOT_APPROVED
                    } as DocumentInfoPresentable
                ],
                expectedActionMessage: 'You have to upload some documents'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.SHIPPED,
                signatures: ['walletAddress'],
                documentInfo: [
                    {
                        status: DocumentStatus.NOT_EVALUATED
                    } as DocumentInfoPresentable
                ],
                expectedActionMessage: 'Some documents need to be validated'
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.SHIPPED,
                signatures: ['walletAddress'],
                documentInfo: [
                    {
                        status: DocumentStatus.APPROVED
                    } as DocumentInfoPresentable
                ],
                expectedActionMessage: undefined
            },
            {
                negotiationStatus: NegotiationStatus.PENDING,
                orderStatus: OrderStatus.COMPLETED,
                signatures: ['walletAddress'],
                documentInfo: [],
                expectedActionMessage: undefined
            }
        ])('should return trade presentables - TradeType.ORDER', async (testCase) => {
            const orderTrade = {
                tradeId: 1,
                supplier: 'walletAddress',
                commissioner: 'commissioner',
                negotiationStatus: testCase.negotiationStatus
            } as OrderTrade;
            const tradeService = {
                getTradeType: jest.fn().mockResolvedValue(TradeType.ORDER)
            } as unknown as TradeService;
            const tradeInstanceService = {
                getTrade: jest.fn().mockResolvedValue(orderTrade),
                getOrderStatus: jest.fn().mockResolvedValue(testCase.orderStatus),
                getWhoSigned: jest.fn().mockResolvedValue(testCase.signatures),
                getNegotiationStatus: jest.fn().mockResolvedValue(testCase.negotiationStatus)
            } as unknown as OrderTradeService;

            tradeManagerService.getTradeIdsOfSupplier = jest.fn().mockResolvedValue([1]);
            tradeManagerService.getTradeIdsOfCommissioner = jest.fn().mockResolvedValue([]);
            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            ethDocumentService.getDocumentsInfoByTransactionIdAndDocumentType = jest
                .fn()
                .mockResolvedValue(testCase.documentInfo);
            getTradeService.mockReturnValue(tradeService);
            getBasicTradeService.mockReturnValue(tradeInstanceService);
            getOrderTradeService.mockReturnValue(tradeInstanceService);
            getNameByDID.mockResolvedValue('name');

            const result = await ethTradeService.getGeneralTrades();
            expect(result).toEqual([
                {
                    id: 1,
                    supplier: 'name',
                    commissioner: 'name',
                    type: TradeType.ORDER,
                    actionRequired: testCase.expectedActionMessage,
                    negotiationStatus: testCase.negotiationStatus,
                    orderStatus: testCase.orderStatus
                }
            ]);

            expect(getTradeService).toHaveBeenCalledWith('tradeAddress');
            expect(tradeService.getTradeType).toHaveBeenCalled();
        });
    });
});
