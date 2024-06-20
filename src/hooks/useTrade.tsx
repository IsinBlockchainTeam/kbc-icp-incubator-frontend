import { useContext, useEffect, useState } from 'react';
import { EthContext } from '@/providers/EthProvider';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch } from 'react-redux';
import { NotificationType, openNotification } from '@/utils/notification';
import { paths } from '@/constants/paths';
import { DetailedTradePresentable } from '@/api/types/TradePresentable';

export default function useTrade(tradeId: number) {
    const { ethTradeService } = useContext(EthContext);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [trade, setTrade] = useState<DetailedTradePresentable>();

    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, []);

    async function loadData() {
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

    const confirmNegotiation = async () => {
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

    return {
        dataLoaded,
        trade,
        confirmNegotiation
    };
}
