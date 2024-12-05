import { DownPaymentDriver, DownPaymentService, TokenDriver, TokenService } from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { DOWN_PAYMENT_MESSAGE, TOKEN_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useOrder } from '@/providers/icp/OrderProvider';

export type EthDownPaymentContextState = {
    exists: boolean;
    downPaymentDetails: DownPaymentDetails;
    tokenDetails: TokenDetails;
    withdraw: (amount: number) => Promise<void>;
    getFees: (amount: number) => Promise<number>;
    loadDownPaymentDetails: () => Promise<void>;
    loadTokenDetails: () => Promise<void>;
};
type DownPaymentDetails = {
    depositedAmount: number;
    totalDepositedAmount: number;
    lockedAmount: number;
    withdrawableAmount: number;
    balance: number;
    baseFee: number;
    percentageFee: number;
};
const defaultDownPaymentDetails: DownPaymentDetails = {
    depositedAmount: 0,
    totalDepositedAmount: 0,
    lockedAmount: 0,
    withdrawableAmount: 0,
    balance: 0,
    baseFee: 0,
    percentageFee: 0
};
type TokenDetails = {
    balance: number;
    symbol: string;
};
const defaultTokenDetails: TokenDetails = {
    balance: 0,
    symbol: ''
};
export const EthDownPaymentContext = createContext<EthDownPaymentContextState>({} as EthDownPaymentContextState);
export const useEthDownPayment = (): EthDownPaymentContextState => {
    const context = useContext(EthDownPaymentContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthDownPayment must be used within an EthDownPaymentProvider.');
    }
    return context;
};
export function EthDownPaymentProvider(props: { children: ReactNode }) {
    const { order } = useOrder();

    const [downPaymentDetails, setDownPaymentDetails] = useState<DownPaymentDetails>(defaultDownPaymentDetails);
    const [tokenDetails, setTokenDetails] = useState<TokenDetails>(defaultTokenDetails);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const downPaymentService = useMemo(() => {
        if (!order || !order.shipment?.downPaymentAddress) return undefined;
        return new DownPaymentService(new DownPaymentDriver(signer, order.shipment.downPaymentAddress));
    }, [signer, order]);

    const exists = useMemo(() => !!downPaymentService, [downPaymentService]);

    const tokenService = useMemo(() => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())), [signer]);

    // Update down payment when order trades change
    useEffect(() => {
        if (order) {
            loadDownPaymentDetails();
            loadTokenDetails();
        }
    }, [order]);

    const loadDownPaymentDetails = async () => {
        if (!downPaymentService) return;
        try {
            dispatch(addLoadingMessage(DOWN_PAYMENT_MESSAGE.RETRIEVE.LOADING));
            const depositedAmount = await downPaymentService.getDepositedAmount(signer._address);
            const totalDepositedAmount = await downPaymentService.getTotalDepositedAmount();
            const lockedAmount = await downPaymentService.getLockedAmount();
            const withdrawableAmount = await downPaymentService.getWithdrawableAmount(signer._address);
            const balance = await downPaymentService.getBalance();
            const baseFee = await downPaymentService.getBaseFee();
            const percentageFee = await downPaymentService.getPercentageFee();
            setDownPaymentDetails({
                depositedAmount,
                totalDepositedAmount,
                lockedAmount,
                withdrawableAmount,
                balance,
                baseFee,
                percentageFee
            });
        } catch (e) {
            console.error('Error loading down payment details', e);
            openNotification('Error', DOWN_PAYMENT_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(DOWN_PAYMENT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadTokenDetails = async () => {
        try {
            dispatch(addLoadingMessage(TOKEN_MESSAGE.RETRIEVE.LOADING));
            const balance = await tokenService.balanceOf(signer._address);
            const symbol = await tokenService.getSymbol();
            setTokenDetails({
                balance,
                symbol
            });
        } catch (e) {
            openNotification('Error', TOKEN_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(TOKEN_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const withdraw = async (amount: number) => {
        if (!downPaymentService) throw new Error('Down payment service not initialized');
        try {
            dispatch(addLoadingMessage(DOWN_PAYMENT_MESSAGE.WITHDRAW.LOADING));
            await downPaymentService.withdraw(amount);
            openNotification('Success', DOWN_PAYMENT_MESSAGE.WITHDRAW.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
            await loadDownPaymentDetails();
            await loadTokenDetails();
        } catch (e) {
            openNotification('Error', DOWN_PAYMENT_MESSAGE.WITHDRAW.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(DOWN_PAYMENT_MESSAGE.WITHDRAW.LOADING));
        }
    };

    const getFees = async (amount: number) => {
        if (!downPaymentService) throw new Error('Down payment service not initialized');
        try {
            return await downPaymentService.getFees(amount);
        } catch (e) {
            openNotification('Error', DOWN_PAYMENT_MESSAGE.WITHDRAW.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
            return 0;
        }
    };

    return (
        <EthDownPaymentContext.Provider
            value={{
                exists,
                downPaymentDetails: downPaymentDetails,
                tokenDetails,
                withdraw,
                getFees,
                loadDownPaymentDetails: loadDownPaymentDetails,
                loadTokenDetails
            }}>
            {props.children}
        </EthDownPaymentContext.Provider>
    );
}
