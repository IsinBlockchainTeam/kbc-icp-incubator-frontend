import { DownPaymentDriver, DownPaymentService, TokenDriver, TokenService } from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ESCROW_MESSAGE, TOKEN_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { CONTRACT_ADDRESSES } from '@/constants/evm';
import { useOrder } from '@/providers/icp/OrderProvider';

export type EthEscrowContextState = {
    exists: boolean;
    escrowDetails: EscrowDetails;
    tokenDetails: TokenDetails;
    withdraw: (amount: number) => Promise<void>;
    getFees: (amount: number) => Promise<number>;
    loadEscrowDetails: () => Promise<void>;
    loadTokenDetails: () => Promise<void>;
};
type EscrowDetails = {
    depositedAmount: number;
    totalDepositedAmount: number;
    lockedAmount: number;
    withdrawableAmount: number;
    balance: number;
    baseFee: number;
    percentageFee: number;
};
const defaultEscrowDetails: EscrowDetails = {
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
export const EthEscrowContext = createContext<EthEscrowContextState>({} as EthEscrowContextState);
export const useEthEscrow = (): EthEscrowContextState => {
    const context = useContext(EthEscrowContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEthEscrow must be used within an EthEscrowProvider.');
    }
    return context;
};
export function EthEscrowProvider(props: { children: ReactNode }) {
    const { order } = useOrder();

    const [escrowDetails, setEscrowDetails] = useState<EscrowDetails>(defaultEscrowDetails);
    const [tokenDetails, setTokenDetails] = useState<TokenDetails>(defaultTokenDetails);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const escrowService = useMemo(() => {
        if (!order || !order.shipment?.downPaymentAddress) return undefined;
        return new DownPaymentService(new DownPaymentDriver(signer, order.shipment.downPaymentAddress));
    }, [signer, order]);

    const exists = useMemo(() => !!escrowService, [escrowService]);

    const tokenService = useMemo(() => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())), [signer]);

    // Update escrow when order trades change
    useEffect(() => {
        if (order) {
            loadEscrowDetails();
            loadTokenDetails();
        }
    }, [order]);

    const loadEscrowDetails = async () => {
        if (!escrowService) return;
        try {
            dispatch(addLoadingMessage(ESCROW_MESSAGE.RETRIEVE.LOADING));
            const depositedAmount = await escrowService.getDepositedAmount(signer._address);
            const totalDepositedAmount = await escrowService.getTotalDepositedAmount();
            const lockedAmount = await escrowService.getLockedAmount();
            const withdrawableAmount = await escrowService.getWithdrawableAmount(signer._address);
            const balance = await escrowService.getBalance();
            const baseFee = await escrowService.getBaseFee();
            const percentageFee = await escrowService.getPercentageFee();
            setEscrowDetails({
                depositedAmount,
                totalDepositedAmount,
                lockedAmount,
                withdrawableAmount,
                balance,
                baseFee,
                percentageFee
            });
        } catch (e) {
            console.error('Error loading escrow details', e);
            openNotification('Error', ESCROW_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(ESCROW_MESSAGE.RETRIEVE.LOADING));
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
        if (!escrowService) throw new Error('Escrow service not initialized');
        try {
            dispatch(addLoadingMessage(ESCROW_MESSAGE.WITHDRAW.LOADING));
            await escrowService.withdraw(amount);
            openNotification('Success', ESCROW_MESSAGE.WITHDRAW.OK, NotificationType.SUCCESS, NOTIFICATION_DURATION);
            await loadEscrowDetails();
            await loadTokenDetails();
        } catch (e) {
            openNotification('Error', ESCROW_MESSAGE.WITHDRAW.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(ESCROW_MESSAGE.WITHDRAW.LOADING));
        }
    };

    const getFees = async (amount: number) => {
        if (!escrowService) throw new Error('Escrow service not initialized');
        try {
            return await escrowService.getFees(amount);
        } catch (e) {
            openNotification('Error', ESCROW_MESSAGE.WITHDRAW.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
            return 0;
        }
    };

    return (
        <EthEscrowContext.Provider
            value={{
                exists,
                escrowDetails,
                tokenDetails,
                withdraw,
                getFees,
                loadEscrowDetails,
                loadTokenDetails
            }}>
            {props.children}
        </EthEscrowContext.Provider>
    );
}
