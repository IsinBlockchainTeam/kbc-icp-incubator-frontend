import useTradeNew from "../tradeNew";
import {renderHook} from "@testing-library/react";
import {TradeType} from "../coffee-trading-management-lib/src/index";
import {FormElement} from "../../../../components/GenericForm/GenericForm";
import {TradeLinePresentable, TradeLinePrice} from "../../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../../api/types/MaterialPresentable";

let mockType: TradeType = TradeType.BASIC;
let mockUpdateType = jest.fn();
let mockTradeService = {
    saveBasicTrade: jest.fn(),
    saveOrderTrade: jest.fn(),

};
let mockElements: FormElement[] = [];
jest.mock("../tradeShared", () => ({
    __esModule: true,
    default: () => ({
        type: mockType,
        updateType: mockUpdateType,
        tradeService: mockTradeService,
        orderState: 0,
        elements: mockElements,
    }),
}));

describe('tradeNew', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    })

    beforeEach(() => {
        mockType = TradeType.BASIC;
        mockElements = [];
    });

    afterEach(() => jest.clearAllMocks());

    it('should update type when clicking on menuProps', async () => {
        const { result } = renderHook(() => useTradeNew());
        expect(result.current.type).toEqual(TradeType.BASIC);
        result.current.menuProps.onClick({ key: '1' });

        expect(mockUpdateType).toHaveBeenCalledTimes(1);
        expect(mockUpdateType).toHaveBeenCalledWith(TradeType.ORDER);
    });

    it('should submit a basic trade', async () => {
        const { result } = renderHook(() => useTradeNew());
        const values = {
            'product-category-id-1': '1',
            'product-category-id-2': '2',
        }
        await result.current.onSubmit(values);

        expect(mockTradeService.saveBasicTrade).toHaveBeenCalledTimes(1);
        expect(mockTradeService.saveBasicTrade).toHaveBeenCalledWith({
            lines: [
                new TradeLinePresentable(0, new MaterialPresentable(1)),
                new TradeLinePresentable(0, new MaterialPresentable(2)),

            ],
            ...values
        });
    });

    it('should submit an order trade', async () => {
        mockType = TradeType.ORDER;
        const { result } = renderHook(() => useTradeNew());
        const values = {
            'product-category-id-1': '1',
            'quantity-1': '10',
            'price-1': '100 CHF',
            'product-category-id-2': '2',
            'quantity-2': '20',
            'price-2': '200 USD',
            'payment-deadline': '2022-01-01',
            'document-delivery-deadline': '2022-02-01',
            'shipping-deadline': '2022-03-01',
            'delivery-deadline': '2022-04-01',
        }
        await result.current.onSubmit(values);

        expect(mockTradeService.saveOrderTrade).toHaveBeenCalledTimes(1);
        expect(mockTradeService.saveOrderTrade).toHaveBeenCalledWith({
            lines: [
                new TradeLinePresentable(0, new MaterialPresentable(1), 10, new TradeLinePrice(100, 'CHF')),
                new TradeLinePresentable(0, new MaterialPresentable(2), 20, new TradeLinePrice(200, 'USD')),
            ],
            paymentDeadline: new Date('2022-01-01'),
            documentDeliveryDeadline: new Date('2022-02-01'),
            shippingDeadline: new Date('2022-03-01'),
            deliveryDeadline: new Date('2022-04-01'),
            ...values,
        });
    });
});
