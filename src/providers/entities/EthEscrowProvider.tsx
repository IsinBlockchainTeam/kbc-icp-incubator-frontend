import {
    EscrowDriver,
    EscrowService,
    EscrowStatus,
    TokenDriver,
    TokenService
} from '@kbc-lib/coffee-trading-management-lib';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ESCROW_MESSAGE, TOKEN_MESSAGE } from '@/constants/message';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { CONTRACT_ADDRESSES } from '@/constants/evm';

export type EthEscrowContextState = {
    dataLoaded: boolean;
    loadData: () => Promise<void>;
    escrowDetails: EscrowDetails;
    tokenDetails: TokenDetails;
    deposit: (amount: number) => Promise<void>;
    payerWithdraw: (amount: number) => Promise<void>;
    getFees: (amount: number) => Promise<number>;
};
type EscrowDetails = {
    state: EscrowStatus;
    depositedAmount: number;
    totalDepositedAmount: number;
    withdrawableAmount: number;
    baseFee: number;
    percentageFee: number;
};
const defaultEscrowDetails: EscrowDetails = {
    state: EscrowStatus.ACTIVE,
    depositedAmount: 0,
    totalDepositedAmount: 0,
    withdrawableAmount: 0,
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
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [escrowDetails, setEscrowDetails] = useState<EscrowDetails>(defaultEscrowDetails);
    const [tokenDetails, setTokenDetails] = useState<TokenDetails>(defaultTokenDetails);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const escrowService = useMemo(
        () => new EscrowService(new EscrowDriver(signer, CONTRACT_ADDRESSES.ESCROW())),
        [signer]
    );
    const tokenService = useMemo(
        () => new TokenService(new TokenDriver(signer, CONTRACT_ADDRESSES.TOKEN())),
        [signer]
    );

    const loadEscrowDetails = async () => {
        try {
            dispatch(addLoadingMessage(ESCROW_MESSAGE.RETRIEVE.LOADING));
            const state = await escrowService.getState();
            const depositedAmount = await escrowService.getDepositedAmount();
            const totalDepositedAmount = await escrowService.getTotalDepositedAmount();
            const withdrawableAmount = await escrowService.getWithdrawableAmount();
            const baseFee = await escrowService.getBaseFee();
            const percentageFee = await escrowService.getPercentageFee();
            setEscrowDetails({
                state,
                depositedAmount,
                totalDepositedAmount,
                withdrawableAmount,
                baseFee,
                percentageFee
            });
        } catch (e) {
            openNotification(
                'Error',
                ESCROW_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
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
            openNotification(
                'Error',
                TOKEN_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(TOKEN_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const deposit = async (amount: number) => {
        try {
            dispatch(addLoadingMessage(ESCROW_MESSAGE.DEPOSIT.LOADING));
            await tokenService.approve(CONTRACT_ADDRESSES.ESCROW(), amount);
            await escrowService.deposit(amount);
            openNotification(
                'Success',
                ESCROW_MESSAGE.DEPOSIT.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadData();
        } catch (e) {
            openNotification(
                'Error',
                ESCROW_MESSAGE.DEPOSIT.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ESCROW_MESSAGE.DEPOSIT.LOADING));
        }
    };

    const payerWithdraw = async (amount: number) => {
        try {
            dispatch(addLoadingMessage(ESCROW_MESSAGE.WITHDRAW.LOADING));
            await escrowService.payerWithdraw(amount);
            openNotification(
                'Success',
                ESCROW_MESSAGE.WITHDRAW.OK,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
            await loadData();
        } catch (e) {
            openNotification(
                'Error',
                ESCROW_MESSAGE.WITHDRAW.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(ESCROW_MESSAGE.WITHDRAW.LOADING));
        }
    };

    const getFees = async (amount: number) => {
        try {
            return await escrowService.getFees(amount);
        } catch (e) {
            openNotification(
                'Error',
                ESCROW_MESSAGE.WITHDRAW.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
            return 0;
        }
    };

    const loadData = async () => {
        await loadEscrowDetails();
        await loadTokenDetails();
        setDataLoaded(true);
    };

    return (
        <EthEscrowContext.Provider
            value={{
                dataLoaded,
                escrowDetails,
                tokenDetails,
                loadData,
                deposit,
                payerWithdraw,
                getFees
            }}>
            {props.children}
        </EthEscrowContext.Provider>
    );
}
