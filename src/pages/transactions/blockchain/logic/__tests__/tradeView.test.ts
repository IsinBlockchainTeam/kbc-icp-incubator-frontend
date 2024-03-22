import {FormElement} from "../../../../../components/GenericForm/GenericForm";
import useTradeView from "../tradeView";
import {renderHook, waitFor} from "@testing-library/react";
import {useLocation, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {DocumentService} from "../../../../../api/services/DocumentService";
import {TradePresentable} from "../../../../../api/types/TradePresentable";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {NotificationType, openNotification} from "../../../../../utils/notification";
import {DocumentPresentable} from "../../../../../api/types/DocumentPresentable";

let mockTradeService = {
    getTradeByIdAndType: jest.fn(),
    putBasicTrade: jest.fn(),
};
let mockElements: FormElement[] = [];
jest.mock("../tradeShared", () => ({
    __esModule: true,
    default: () => ({
        tradeService: mockTradeService,
        orderState: 0,
        elements: mockElements,
    }),
}));
jest.mock("../../../../../utils/utils", () => ({
    checkAndGetEnvironmentVariable: jest.fn()
}));
jest.mock('../../../../../utils/notification', () => ({
    ...jest.requireActual('../../../../../utils/notification'),
    openNotification: jest.fn()
}));
jest.mock('../../../../../api/services/DocumentService');
jest.mock("../../../../../api/strategies/document/BlockchainDocumentStrategy", () => ({
    BlockchainDocumentStrategy: jest.fn()
}));
jest.mock('react-router-dom');

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(),
}));

const mockInitialState = {
    auth: {
        subjectClaims: {
            podServerUrl: 'mockedPodServerUrl',
            podClientId: 'mockedPodClientId',
            podClientSecret: 'mockedPodClientSecret'
        }
    }
};

describe('tradeView', () => {
    const mockGetDocumentsByTransactionIdAndType = jest.fn();
    beforeEach(() => {
        (useLocation as jest.Mock).mockReturnValue({ search: '?type=1' });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockInitialState));
        (DocumentService as jest.Mock).mockReturnValue({
            getDocumentsByTransactionIdAndType: mockGetDocumentsByTransactionIdAndType
        });
        mockElements = [];
    });

    afterEach(() => jest.clearAllMocks());

    it('should toggle disabled', async () => {
        const { result } = renderHook(() => useTradeView());
        expect(result.current.disabled).toEqual(true);
        result.current.toggleDisabled();
        await waitFor(() => expect(result.current.disabled).toEqual(false));
    });

    it('should get trade info and documents', async () => {
        mockTradeService.getTradeByIdAndType.mockReturnValue(new TradePresentable(1, [], 'supplier', TradeType.BASIC));
        const mockGetDocumentsByTransactionIdAndType = jest.fn().mockReturnValue(new DocumentPresentable(1, "test document", "application/pdf"));
        (DocumentService as jest.Mock).mockReturnValue({
            getDocumentsByTransactionIdAndType: mockGetDocumentsByTransactionIdAndType
        });

        const { result } = renderHook(() => useTradeView());
        await waitFor(() => expect(mockTradeService.getTradeByIdAndType).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(mockTradeService.getTradeByIdAndType).toHaveBeenCalledWith(1, 1));
        await waitFor(() => expect(mockGetDocumentsByTransactionIdAndType).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(result.current.trade).toBeDefined());
        await waitFor(() => expect(result.current.documents).toBeDefined());
    });

    it('should submit', async () => {
        mockTradeService.getTradeByIdAndType.mockReturnValue(new TradePresentable(1, [], 'supplier', TradeType.BASIC));

        const { result } = renderHook(() => useTradeView());
        await waitFor(() => expect(result.current.trade).toBeDefined());

        const values = {
            'shipping-deadline': '2022-01-01',
            'delivery-deadline': '2022-02-01',
        };
        await result.current.onSubmit(values);
        await waitFor(() => expect(mockTradeService.putBasicTrade).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(mockTradeService.putBasicTrade).toHaveBeenCalledWith(1, values));
    });

    it('should not submit if delivery deadline is before shipping deadline', async () => {
        const { result } = renderHook(() => useTradeView());
        const values = {
            'shipping-deadline': '2022-01-01',
            'delivery-deadline': '2020-02-01',
        };
        await result.current.onSubmit(values);

        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith("Invalid dates", '', NotificationType.ERROR);
        expect(mockTradeService.putBasicTrade).not.toHaveBeenCalled();
    });

    it('should not load values if subjectClaims are not defined', () => {
        (useSelector as jest.Mock).mockImplementation(jest.fn());
        renderHook(() => useTradeView());
        expect(openNotification).toHaveBeenCalledTimes(1);
        expect(openNotification).toHaveBeenCalledWith("Error", "No information about company storage", NotificationType.ERROR);
        expect(mockGetDocumentsByTransactionIdAndType).not.toHaveBeenCalled();
        expect(mockTradeService.getTradeByIdAndType).not.toHaveBeenCalled();
    });

    it('should not set documents if response is undefined', async () => {

    });
});