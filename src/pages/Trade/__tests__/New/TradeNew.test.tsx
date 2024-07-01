import { useLocation, useNavigate } from 'react-router-dom';
import { act, render, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { SignerContext, SignerContextState } from '@/providers/SignerProvider';
import { TradeNew } from '@/pages/Trade/New/TradeNew';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import useActorName from '@/hooks/useActorName';
import { paths } from '@/constants/paths';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/hooks/useActorName');
jest.mock('@/pages/Trade/New/BasicTradeNew');
jest.mock('@/pages/Trade/New/OrderTradeNew');
jest.mock('@/utils/notification');

const mockStore = configureStore([]);

describe('Trade New', () => {
    const signerContextValue = {
        signer: {
            address: '0x123'
        }
    } as unknown as SignerContextState;
    const store = mockStore();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly - ORDER', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            state: { supplierAddress: '0xaddress', productCategoryId: 1 }
        });
        (useActorName as jest.Mock).mockReturnValue({ getActorName: () => 'Actor Name' });
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <TradeNew />
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(OrderTradeNew).toHaveBeenCalledTimes(1);
        });
        expect(OrderTradeNew).toHaveBeenCalledTimes(1);
        const commonElements = (OrderTradeNew as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('Actor Name');
        expect(commonElements[2].defaultValue).toEqual('Actor Name');
        expect(commonElements[3].defaultValue).toEqual('Actor Name');
    });

    it('should navigate to HOME if location is not valid', async () => {
        const mockedNavigate = jest.fn();
        (useLocation as jest.Mock).mockReturnValue({
            state: { supplierAddress: '0xaddress' }
        });
        (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
        (useActorName as jest.Mock).mockReturnValue({ getActorName: () => 'Actor Name' });
        await act(async () => {
            render(
                <Provider store={store}>
                    <SignerContext.Provider value={signerContextValue}>
                        <TradeNew />
                    </SignerContext.Provider>
                </Provider>
            );
        });
        await waitFor(() => {
            expect(OrderTradeNew).toHaveBeenCalledTimes(1);
        });
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(paths.HOME);
    });
});
