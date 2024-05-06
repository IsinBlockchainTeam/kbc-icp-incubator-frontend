import useTradeShared from "../tradeShared";
import {TradeType} from "../coffee-trading-management-lib/src/index";
import {useSelector} from "react-redux";
import {renderHook, waitFor} from "@testing-library/react";
import {ClickableElement} from "../../../../components/GenericForm/GenericForm";
import * as uuid from 'uuid';

jest.mock("../../../../../api/services/EthTradeService", () => ({
    TradeService: jest.fn()
}));
jest.mock("../../../../../api/strategies/trade/BlockchainTradeStrategy", () => ({
    BlockchainTradeStrategy: jest.fn()
}));
jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(),
}));

jest.mock("uuid");
const uuidSpy = jest.spyOn(uuid, 'v4');

const mockInitialState = {
    auth: {
        subjectClaims: {
            podServerUrl: 'mockedPodServerUrl',
            podClientId: 'mockedPodClientId',
            podClientSecret: 'mockedPodClientSecret'
        }
    }
};

describe('tradeShared', () => {
    let mockId: number = 1;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

    });
    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(mockInitialState));
        mockId = 1;
        uuidSpy.mockReturnValue(`mocked-${mockId++}`);
    });

    it('should update trade type', async () => {
        const { result } = renderHook(() => useTradeShared());
        expect(result.current.type).toEqual(TradeType.BASIC);

        result.current.updateType(TradeType.ORDER);
        await waitFor(() => expect(result.current.type).toEqual(TradeType.ORDER));
    });

    it('should add a new line', async () => {
        const { result } = renderHook(() => useTradeShared());
        const elementLength = result.current.elements.length;
        const addLine = result.current.elements.find((element) => (element as ClickableElement).name === 'new-line');
        expect(addLine).toBeDefined();
        // @ts-ignore
        (addLine as ClickableElement)?.onClick();
        expect(uuidSpy).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(result.current.elements.length).toEqual(elementLength + 3));
    });
});
