import {TradePresentable} from "../TradePresentable";
import {TradeLinePresentable} from "../TradeLinePresentable";
import {TradeStatus, TradeType} from "@kbc-lib/coffee-trading-management-lib";

jest.mock('../../../utils/utils', () => ({
    ...jest.requireActual('../../../utils/utils'),
    checkAndGetEnvironmentVariable: jest.fn(),
}));

describe('TradePresentable', () => {
    const tradePresentable = new TradePresentable();

    const date = new Date('2021-01-01');

    it('should be empty', () => {
        expect(tradePresentable.id).toBeUndefined();
        expect(tradePresentable.name).toBeUndefined();
        expect(tradePresentable.lines).toBeUndefined();
        expect(tradePresentable.supplier).toBeUndefined();
        expect(tradePresentable.customer).toBeUndefined();
        expect(tradePresentable.commissioner).toBeUndefined();
        expect(tradePresentable.incoterms).toBeUndefined();
        expect(tradePresentable.paymentDeadline).toBeUndefined();
        expect(tradePresentable.documentDeliveryDeadline).toBeUndefined();
        expect(tradePresentable.shipper).toBeUndefined();
        expect(tradePresentable.arbiter).toBeUndefined();
        expect(tradePresentable.shippingPort).toBeUndefined();
        expect(tradePresentable.shippingDeadline).toBeUndefined();
        expect(tradePresentable.deliveryPort).toBeUndefined();
        expect(tradePresentable.deliveryDeadline).toBeUndefined();
        expect(tradePresentable.agreedAmount).toBeUndefined();
        expect(tradePresentable.tokenAddress).toBeUndefined();
        expect(tradePresentable.escrow).toBeUndefined();
        expect(tradePresentable.status).toBeUndefined();
        expect(tradePresentable.type).toBeUndefined();
    });

    it('should set the id', () => {
        tradePresentable.setId(1);
        expect(tradePresentable.id).toBe(1);
    });

    it('should set the name', () => {
        tradePresentable.setName('name');
        expect(tradePresentable.name).toBe('name');
    });

    it('should set the lines', () => {
        const lines = [new TradeLinePresentable(1)];
        tradePresentable.setLines(lines);
        expect(tradePresentable.lines).toBe(lines);
    });

    it('should set the supplier', () => {
        tradePresentable.setSupplier('supplier');
        expect(tradePresentable.supplier).toBe('supplier');
    });

    it('should set the customer', () => {
        tradePresentable.setCustomer('customer');
        expect(tradePresentable.customer).toBe('customer');
    });

    it('should set the commissioner', () => {
        tradePresentable.setCommissioner('commissioner');
        expect(tradePresentable.commissioner).toBe('commissioner');
    });

    it('should set the incoterms', () => {
        tradePresentable.setIncoterms('incoterms');
        expect(tradePresentable.incoterms).toBe('incoterms');
    });

    it('should set the paymentDeadline', () => {
        tradePresentable.setPaymentDeadline(date);
        expect(tradePresentable.paymentDeadline).toBe(date);
    });

    it('should set the documentDeliveryDeadline', () => {
        tradePresentable.setDocumentDeliveryDeadline(date);
        expect(tradePresentable.documentDeliveryDeadline).toBe(date);
    });

    it('should set the shipper', () => {
        tradePresentable.setShipper('shipper');
        expect(tradePresentable.shipper).toBe('shipper');
    });

    it('should set the arbiter', () => {
        tradePresentable.setArbiter('arbiter');
        expect(tradePresentable.arbiter).toBe('arbiter');
    });

    it('should set the shippingPort', () => {
        tradePresentable.setShippingPort('shippingPort');
        expect(tradePresentable.shippingPort).toBe('shippingPort');
    });

    it('should set the shippingDeadline', () => {
        tradePresentable.setShippingDeadline(date);
        expect(tradePresentable.shippingDeadline).toBe(date);
    });

    it('should set the deliveryPort', () => {
        tradePresentable.setDeliveryPort('deliveryPort');
        expect(tradePresentable.deliveryPort).toBe('deliveryPort');
    });

    it('should set the deliveryDeadline', () => {
        tradePresentable.setDeliveryDeadline(date);
        expect(tradePresentable.deliveryDeadline).toBe(date);
    });

    it('should set the agreedAmount', () => {
        tradePresentable.setAgreedAmount(1);
        expect(tradePresentable.agreedAmount).toBe(1);
    });

    it('should set the tokenAddress', () => {
        tradePresentable.setTokenAddress('tokenAddress');
        expect(tradePresentable.tokenAddress).toBe('tokenAddress');
    });

    it('should set the escrow', () => {
        tradePresentable.setEscrow('escrow');
        expect(tradePresentable.escrow).toBe('escrow');
    });

    it('should set the status', () => {
        tradePresentable.setStatus(TradeStatus.ON_BOARD);
        expect(tradePresentable.status).toBe('ON_BOARD');
    });

    it('should set null status', () => {
        tradePresentable.setStatus(undefined);
        expect(tradePresentable.status).toBeUndefined();
    });

    it('should set the type', () => {
        tradePresentable.setType(TradeType.ORDER);
        expect(tradePresentable.type).toBe(TradeType.ORDER);
    });
});
