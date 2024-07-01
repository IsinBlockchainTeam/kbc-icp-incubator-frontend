import { useContext, useState } from 'react';
import { EthContext } from '@/providers/EthProvider';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';
import { paths } from '@/constants/paths';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export default function useTrade() {
    const { ethTradeService } = useContext(EthContext);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [trade, setTrade] = useState<DetailedTradePresentable>();

    async function loadData(tradeId: number) {
        try {
            dispatch(showLoading('Retrieving trade...'));

            const trade = await ethTradeService.getTradeById(tradeId);
            setTrade(trade);

            setDataLoaded(true);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', 'Error while retrieving trade', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }

    const confirmNegotiation = async (tradeId: number) => {
        try {
            dispatch(showLoading('Confirming negotiation...'));
            await ethTradeService.confirmOrderTrade(tradeId);
            openNotification(
                'Negotiation confirmed',
                `The negotiation has been confirmed`,
                NotificationType.SUCCESS,
                1
            );
            navigate(paths.TRADES);
        } catch (e: any) {
            openNotification('Error', 'Error while confirming negotiation', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    const saveBasicTrade = async (
        basicTradeRequest: BasicTradeRequest,
        documentRequests: DocumentRequest[]
    ) => {
        try {
            dispatch(showLoading('Creating trade...'));
            await ethTradeService.saveBasicTrade(basicTradeRequest, documentRequests);
            openNotification(
                'Basic trade created',
                `The trade has been created`,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification('Error', 'Error while creating trade', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    const updateBasicTrade = async (tradeId: number, basicTradeRequest: BasicTradeRequest) => {
        try {
            dispatch(showLoading('Updating trade...'));
            await ethTradeService.putBasicTrade(tradeId, basicTradeRequest);
            openNotification(
                'Basic trade updated',
                `The trade has been created`,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification('Error', 'Error while updating trade', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    const saveOrderTrade = async (orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(showLoading('Creating trade...'));
            await ethTradeService.saveOrderTrade(orderTradeRequest);
            openNotification(
                'Order trade created',
                `The trade has been created`,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification('Error', 'Error while creating trade', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    const updateOrderTrade = async (tradeId: number, orderTradeRequest: OrderTradeRequest) => {
        try {
            dispatch(showLoading('Updating trade...'));
            await ethTradeService.putOrderTrade(tradeId, orderTradeRequest);
            openNotification(
                'Order trade updated',
                `The trade has been created`,
                NotificationType.SUCCESS,
                NOTIFICATION_DURATION
            );
        } catch (e: any) {
            openNotification('Error', 'Error while updating trade', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    return {
        loadData,
        dataLoaded,
        trade,
        saveBasicTrade,
        updateBasicTrade,
        saveOrderTrade,
        updateOrderTrade,
        confirmNegotiation
    };
}
