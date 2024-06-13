import { EthTradeService } from '@/api/services/EthTradeService';
import {
    BasicTrade,
    BasicTradeService,
    DocumentService,
    DocumentStatus,
    DocumentType,
    Line,
    MaterialService,
    NegotiationStatus,
    OrderLine,
    OrderLinePrice,
    OrderStatus,
    OrderTrade,
    OrderTradeService,
    ProductCategory,
    ProductCategoryService,
    Trade,
    TradeManagerService,
    TradeManagerServiceArgs,
    TradeService,
    TradeType
} from '@kbc-lib/coffee-trading-management-lib';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { DocumentInfoPresentable, DocumentPresentable } from '@/api/types/DocumentPresentable';
import { BasicTradePresentable, OrderTradePresentable } from '@/api/types/TradePresentable';
import { getICPCanisterURL } from '@/utils/icp';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/utils/icp');

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
                negotiationStatus: NegotiationStatus.CONFIRMED,
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
    describe('getTradeById', () => {
        it('should throw an error when trade is not found', async () => {
            const tradeId = 1;
            tradeManagerService.getTrade = jest.fn().mockResolvedValue(null);

            await expect(ethTradeService.getTradeById(tradeId)).rejects.toThrow('Trade not found');
        });
        it('should return a BasicTradePresentable when trade type is BASIC', async () => {
            const tradeId = 1;
            const basicTrade = {
                tradeId: tradeId,
                supplier: 'supplier',
                commissioner: 'commissioner'
            } as BasicTrade;
            const lines = [
                {
                    id: 1
                }
            ] as Line[];
            const documents = [
                {
                    documentType: DocumentType.METADATA,
                    filename: 'filename'
                }
            ] as DocumentPresentable[];
            const basicTradeService = {
                getTrade: jest.fn().mockResolvedValue(basicTrade),
                getLines: jest.fn().mockResolvedValue(lines)
            } as unknown as BasicTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            tradeManagerService.getTradeType = jest.fn().mockResolvedValue(TradeType.BASIC);
            getBasicTradeService.mockReturnValue(basicTradeService);
            ethDocumentService.getDocumentsByTransactionId = jest.fn().mockResolvedValue(documents);

            const result = await ethTradeService.getTradeById(tradeId);
            expect(result).toBeInstanceOf(BasicTradePresentable);
            expect(result.trade).toEqual(basicTrade);
            expect(result.documents.has(DocumentType.METADATA)).toBeTruthy();
            expect(result.documents.get(DocumentType.METADATA)).toEqual(documents[0]);
        });
        it('should return a BasicTradePresentable when trade type is ORDER', async () => {
            const tradeId = 1;
            const orderTrade = {
                tradeId: tradeId,
                supplier: 'supplier',
                commissioner: 'commissioner'
            } as OrderTrade;
            const lines = [
                {
                    id: 1
                }
            ] as Line[];
            const documents = [
                {
                    documentType: DocumentType.METADATA,
                    filename: 'filename'
                }
            ] as DocumentPresentable[];
            const orderTradeService = {
                getCompleteTrade: jest.fn().mockResolvedValue(orderTrade),
                getLines: jest.fn().mockResolvedValue(lines),
                getOrderStatus: jest.fn().mockResolvedValue(OrderStatus.PRODUCTION)
            } as unknown as OrderTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            tradeManagerService.getTradeType = jest.fn().mockResolvedValue(TradeType.ORDER);
            getOrderTradeService.mockReturnValue(orderTradeService);
            ethDocumentService.getDocumentsByTransactionId = jest.fn().mockResolvedValue(documents);

            const result = await ethTradeService.getTradeById(tradeId);
            expect(result).toBeInstanceOf(OrderTradePresentable);
            expect(result.trade).toEqual(orderTrade);
            expect(result.documents.has(DocumentType.METADATA)).toBeTruthy();
            expect(result.documents.get(DocumentType.METADATA)).toEqual(documents[0]);
        });
    });
    describe('saveBasicTrade', () => {
        it('should register a basic trade and add a document if provided', async () => {
            const basicTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                name: 'tradeName',
                lines: [{ id: 1 }]
            } as unknown as BasicTradeRequest;
            const documentRequest = {
                documentType: DocumentType.DELIVERY_NOTE,
                filename: 'filename',
                content: new Blob(['content'])
            };
            const basicTrade = {
                externalUrl: 'externalUrl'
            } as BasicTrade;
            const basicTradeService = {
                getTrade: jest.fn().mockResolvedValue(basicTrade)
            } as unknown as BasicTradeService;

            (getICPCanisterURL as jest.Mock).mockReturnValue('externalUrl');
            tradeManagerService.registerBasicTrade = jest
                .fn()
                .mockResolvedValue(['', 'tradeAddress', 'transactionHash']);
            getBasicTradeService.mockReturnValue(basicTradeService);
            basicTradeService.getTrade = jest.fn().mockResolvedValue(basicTrade);
            basicTradeService.addDocument = jest.fn();
            basicTradeService.addLine = jest.fn();

            await ethTradeService.saveBasicTrade(basicTradeRequest, [documentRequest]);

            expect(tradeManagerService.registerBasicTrade).toHaveBeenCalledWith(
                basicTradeRequest.supplier,
                basicTradeRequest.customer,
                basicTradeRequest.commissioner,
                basicTradeRequest.name,
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
            expect(waitForTransactions).toHaveBeenCalledWith('transactionHash', expect.anything());
            expect(basicTradeService.addDocument).toHaveBeenCalledWith(
                documentRequest.documentType,
                expect.anything(),
                'externalUrl',
                expect.anything(),
                expect.anything()
            );
            expect(basicTradeService.addLine).toHaveBeenCalledWith(basicTradeRequest.lines[0]);
        });
    });
    describe('putBasicTrade', () => {
        it('should update trade name if it has changed', async () => {
            const tradeId = 1;
            const oldTrade = { name: 'oldName', lines: [] } as unknown as BasicTrade;
            const newTrade = { name: 'newName', lines: [] } as unknown as BasicTradeRequest;
            const basicTradeService = {
                getTrade: jest.fn().mockResolvedValue(oldTrade),
                setName: jest.fn()
            } as unknown as BasicTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getBasicTradeService.mockReturnValue(basicTradeService);

            await ethTradeService.putBasicTrade(tradeId, newTrade);

            expect(basicTradeService.setName).toHaveBeenCalledWith(newTrade.name);
        });
        it('should update line if it has changed', async () => {
            const tradeId = 1;
            const oldTrade = {
                name: 'name',
                lines: [{ id: 1, productCategory: { id: 1 }, unit: 'kg', quantity: 10 }]
            } as BasicTrade;
            const newTrade = {
                name: 'name',
                lines: [{ id: 1, productCategoryId: 2, unit: 'lb', quantity: 20 }]
            } as BasicTradeRequest;
            const productCategory = { id: 2 } as ProductCategory;
            const basicTradeService = {
                getTrade: jest.fn().mockResolvedValue(oldTrade),
                updateLine: jest.fn()
            } as unknown as BasicTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getBasicTradeService.mockReturnValue(basicTradeService);
            ethMaterialService.getProductCategory = jest.fn().mockResolvedValue(productCategory);

            await ethTradeService.putBasicTrade(tradeId, newTrade);

            expect(basicTradeService.updateLine).toHaveBeenCalled();
            expect(basicTradeService.updateLine).toHaveBeenCalledWith(
                new Line(1, undefined, productCategory, 20, 'lb')
            );
        });
        it('should not update trade if it has not changed', async () => {
            const tradeId = 1;
            const oldTrade = {
                name: 'name',
                lines: [{ id: 1, productCategory: { id: 1 }, unit: 'kg', quantity: 10 }]
            } as BasicTrade;
            const newTrade = {
                name: 'name',
                lines: [{ id: 1, productCategoryId: 1, unit: 'kg', quantity: 10 }]
            } as BasicTradeRequest;
            const basicTradeService = {
                getTrade: jest.fn().mockResolvedValue(oldTrade),
                setName: jest.fn(),
                updateLine: jest.fn()
            } as unknown as BasicTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getBasicTradeService.mockReturnValue(basicTradeService);

            await ethTradeService.putBasicTrade(tradeId, newTrade);

            expect(basicTradeService.setName).not.toHaveBeenCalled();
            expect(basicTradeService.updateLine).not.toHaveBeenCalled();
        });
    });
    describe('saveOrderTrade', () => {
        it('should register an order trade and add a document if provided', async () => {
            const orderTradeRequest = {
                supplier: 'supplier',
                customer: 'customer',
                commissioner: 'commissioner',
                incoterms: 'incoterms',
                shipper: 'shipper',
                shippingPort: 'shippingPort',
                deliveryPort: 'deliveryPort',
                lines: [{ id: 1 }]
            } as unknown as OrderTradeRequest;
            const documentRequest = {
                documentType: DocumentType.PAYMENT_INVOICE,
                filename: 'filename',
                content: new Blob(['content'])
            };
            const orderTradeService = {
                getTrade: jest.fn().mockResolvedValue({ externalUrl: 'externalUrl' }),
                addDocument: jest.fn(),
                addLine: jest.fn()
            } as unknown as OrderTradeService;

            (getICPCanisterURL as jest.Mock).mockReturnValue('externalUrl');
            tradeManagerService.registerOrderTrade = jest
                .fn()
                .mockResolvedValue(['', 'tradeAddress', 'transactionHash']);
            getOrderTradeService.mockReturnValue(orderTradeService);

            await ethTradeService.saveOrderTrade(orderTradeRequest, [documentRequest]);

            expect(tradeManagerService.registerOrderTrade).toHaveBeenCalledWith(
                orderTradeRequest.supplier,
                orderTradeRequest.customer,
                orderTradeRequest.commissioner,
                orderTradeRequest.paymentDeadline,
                orderTradeRequest.documentDeliveryDeadline,
                orderTradeRequest.arbiter,
                orderTradeRequest.shippingDeadline,
                orderTradeRequest.deliveryDeadline,
                orderTradeRequest.agreedAmount,
                orderTradeRequest.tokenAddress,
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
            expect(waitForTransactions).toHaveBeenCalledWith('transactionHash', expect.anything());
            expect(orderTradeService.addDocument).toHaveBeenCalledWith(
                documentRequest.documentType,
                expect.anything(),
                'externalUrl',
                expect.anything(),
                expect.anything()
            );
            expect(orderTradeService.addLine).toHaveBeenCalledWith(orderTradeRequest.lines[0]);
        });
    });
    describe('putOrderTrade', () => {
        it('should update trade details if they have changed', async () => {
            const tradeId = 1;
            const oldTrade = {
                paymentDeadline: 'oldDeadline',
                documentDeliveryDeadline: 'oldDeliveryDeadline',
                arbiter: 'oldArbiter',
                shippingDeadline: 'oldShippingDeadline',
                deliveryDeadline: 'oldDeliveryDeadline',
                agreedAmount: 'oldAmount',
                tokenAddress: 'oldTokenAddress',
                lines: [
                    {
                        productCategory: { id: 1 },
                        unit: 'kg',
                        quantity: 10,
                        price: { amount: 10, fiat: 'USD' }
                    }
                ]
            } as unknown as OrderTrade;
            const newTrade = {
                paymentDeadline: 'newDeadline',
                documentDeliveryDeadline: 'newDeliveryDeadline',
                arbiter: 'newArbiter',
                shippingDeadline: 'newShippingDeadline',
                deliveryDeadline: 'newDeliveryDeadline',
                agreedAmount: 'newAmount',
                tokenAddress: 'newTokenAddress',
                lines: [
                    {
                        productCategoryId: 2,
                        unit: 'lb',
                        quantity: 20,
                        price: { amount: 20, fiat: 'EUR' }
                    }
                ]
            } as unknown as OrderTradeRequest;
            const productCategory = { id: 2 } as ProductCategory;
            const orderTradeService = {
                getTrade: jest.fn().mockResolvedValue(oldTrade),
                updatePaymentDeadline: jest.fn(),
                updateDocumentDeliveryDeadline: jest.fn(),
                updateArbiter: jest.fn(),
                updateShippingDeadline: jest.fn(),
                updateDeliveryDeadline: jest.fn(),
                updateAgreedAmount: jest.fn(),
                updateTokenAddress: jest.fn(),
                updateLine: jest.fn()
            } as unknown as OrderTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getOrderTradeService.mockReturnValue(orderTradeService);
            ethMaterialService.getProductCategory = jest.fn().mockResolvedValue(productCategory);

            await ethTradeService.putOrderTrade(tradeId, newTrade);

            expect(orderTradeService.updatePaymentDeadline).toHaveBeenCalledWith(
                newTrade.paymentDeadline
            );
            expect(orderTradeService.updateDocumentDeliveryDeadline).toHaveBeenCalledWith(
                newTrade.documentDeliveryDeadline
            );
            expect(orderTradeService.updateArbiter).toHaveBeenCalledWith(newTrade.arbiter);
            expect(orderTradeService.updateShippingDeadline).toHaveBeenCalledWith(
                newTrade.shippingDeadline
            );
            expect(orderTradeService.updateDeliveryDeadline).toHaveBeenCalledWith(
                newTrade.deliveryDeadline
            );
            expect(orderTradeService.updateAgreedAmount).toHaveBeenCalledWith(
                newTrade.agreedAmount
            );
            expect(orderTradeService.updateTokenAddress).toHaveBeenCalledWith(
                newTrade.tokenAddress
            );
            expect(orderTradeService.updateLine).toHaveBeenCalledWith(
                new OrderLine(
                    1,
                    undefined,
                    productCategory,
                    20,
                    'lb',
                    new OrderLinePrice(20, 'EUR')
                )
            );
        });

        it('should not update trade details if they have not changed', async () => {
            const tradeId = 1;
            const oldTrade = {
                paymentDeadline: 'sameDeadline',
                documentDeliveryDeadline: 'sameDeliveryDeadline',
                arbiter: 'sameArbiter',
                shippingDeadline: 'sameShippingDeadline',
                deliveryDeadline: 'sameDeliveryDeadline',
                agreedAmount: 'sameAmount',
                tokenAddress: 'sameTokenAddress',
                lines: [
                    {
                        productCategory: { id: 1 },
                        unit: 'kg',
                        quantity: 10,
                        price: { amount: 10, fiat: 'USD' }
                    }
                ]
            } as unknown as OrderTrade;
            const newTrade = {
                paymentDeadline: 'sameDeadline',
                documentDeliveryDeadline: 'sameDeliveryDeadline',
                arbiter: 'sameArbiter',
                shippingDeadline: 'sameShippingDeadline',
                deliveryDeadline: 'sameDeliveryDeadline',
                agreedAmount: 'sameAmount',
                tokenAddress: 'sameTokenAddress',
                lines: [
                    {
                        productCategoryId: 1,
                        unit: 'kg',
                        quantity: 10,
                        price: { amount: 10, fiat: 'USD' }
                    }
                ]
            } as unknown as OrderTradeRequest;
            const orderTradeService = {
                getTrade: jest.fn().mockResolvedValue(oldTrade),
                updatePaymentDeadline: jest.fn(),
                updateDocumentDeliveryDeadline: jest.fn(),
                updateArbiter: jest.fn(),
                updateShippingDeadline: jest.fn(),
                updateDeliveryDeadline: jest.fn(),
                updateAgreedAmount: jest.fn(),
                updateTokenAddress: jest.fn(),
                updateLine: jest.fn()
            } as unknown as OrderTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getOrderTradeService.mockReturnValue(orderTradeService);

            await ethTradeService.putOrderTrade(tradeId, newTrade);

            expect(orderTradeService.updatePaymentDeadline).not.toHaveBeenCalled();
            expect(orderTradeService.updateDocumentDeliveryDeadline).not.toHaveBeenCalled();
            expect(orderTradeService.updateArbiter).not.toHaveBeenCalled();
            expect(orderTradeService.updateShippingDeadline).not.toHaveBeenCalled();
            expect(orderTradeService.updateDeliveryDeadline).not.toHaveBeenCalled();
            expect(orderTradeService.updateAgreedAmount).not.toHaveBeenCalled();
            expect(orderTradeService.updateTokenAddress).not.toHaveBeenCalled();
            expect(orderTradeService.updateLine).not.toHaveBeenCalled();
        });
    });
    describe('addDocument', () => {
        it('should add document to a basic trade', async () => {
            const tradeId = 1;
            const documentRequest = {
                documentType: DocumentType.DELIVERY_NOTE,
                filename: 'filename',
                content: new Blob(['content'])
            };
            const basicTradeService = {
                addDocument: jest.fn()
            } as unknown as BasicTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getBasicTradeService.mockReturnValue(basicTradeService);

            await ethTradeService.addDocument(
                tradeId,
                TradeType.BASIC,
                documentRequest,
                'externalUrl'
            );

            expect(basicTradeService.addDocument).toHaveBeenCalledWith(
                documentRequest.documentType,
                expect.anything(),
                'externalUrl',
                expect.anything(),
                expect.anything()
            );
        });
        it('should add document to an order trade', async () => {
            const tradeId = 1;
            const documentRequest = {
                documentType: DocumentType.PAYMENT_INVOICE,
                filename: 'filename',
                content: new Blob(['content'])
            };
            const orderTradeService = {
                addDocument: jest.fn()
            } as unknown as OrderTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getOrderTradeService.mockReturnValue(orderTradeService);

            await ethTradeService.addDocument(
                tradeId,
                TradeType.ORDER,
                documentRequest,
                'externalUrl'
            );

            expect(orderTradeService.addDocument).toHaveBeenCalledWith(
                documentRequest.documentType,
                expect.anything(),
                'externalUrl',
                expect.anything(),
                expect.anything()
            );
        });
    });
    describe('validateDocument', () => {
        it('should validate a document', async () => {
            const tradeId = 1;
            const documentId = 1;
            const validationStatus = DocumentStatus.APPROVED;
            const tradeService = {
                validateDocument: jest.fn()
            } as unknown as TradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getTradeService.mockReturnValue(tradeService);

            await ethTradeService.validateDocument(tradeId, documentId, validationStatus);

            expect(tradeService.validateDocument).toHaveBeenCalledWith(
                documentId,
                validationStatus
            );
        });
    });
    describe('confirmOrderTrade', () => {
        it('should confirm an order trade', async () => {
            const tradeId = 1;
            const orderTradeService = {
                confirmOrder: jest.fn()
            } as unknown as OrderTradeService;

            tradeManagerService.getTrade = jest.fn().mockResolvedValue('tradeAddress');
            getOrderTradeService.mockReturnValue(orderTradeService);

            await ethTradeService.confirmOrderTrade(tradeId);

            expect(orderTradeService.confirmOrder).toHaveBeenCalled();
        });
    });
});
