import {TradeLinePresentable, TradeLinePrice} from "../TradeLinePresentable";
import {MaterialPresentable} from "../MaterialPresentable";

describe('TradeLinePresentable', () => {
    const tradeLinePresentable = new TradeLinePresentable();

    it('should be empty', () => {
        expect(tradeLinePresentable.id).toBeUndefined();
        expect(tradeLinePresentable.material).toBeUndefined();
        expect(tradeLinePresentable.quantity).toBeUndefined();
        expect(tradeLinePresentable.price).toBeUndefined();
    });

    it('should set id', () => {
        tradeLinePresentable.setId(1);
        expect(tradeLinePresentable.id).toBe(1);
    });

    it('should set material', () => {
        const material = new MaterialPresentable(1, 'material');
        tradeLinePresentable.setMaterial(material);
        expect(tradeLinePresentable.material).toBe(material);
    });

    it('should set quantity', () => {
        tradeLinePresentable.setQuantity(1);
        expect(tradeLinePresentable.quantity).toBe(1);
    });

    it('should set price', () => {
        const tradeLinePrice = new TradeLinePrice(10, 'USD');
        tradeLinePresentable.setPrice(tradeLinePrice);
        expect(tradeLinePresentable.price).toBe(tradeLinePrice);
    });
});

describe('TradeLinePrice', () => {
    const tradeLinePrice = new TradeLinePrice();

    it('should be empty', () => {
        expect(tradeLinePrice.amount).toBeUndefined();
        expect(tradeLinePrice.fiat).toBeUndefined();
    });

    it('should set amount', () => {
        tradeLinePrice.setAmount(10);
        expect(tradeLinePrice.amount).toBe(10);
    });

    it('should set fiat', () => {
        tradeLinePrice.setFiat('USD');
        expect(tradeLinePrice.fiat).toBe('USD');
    });
});