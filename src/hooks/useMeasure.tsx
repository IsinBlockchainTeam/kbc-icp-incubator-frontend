import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { EthContext } from '@/providers/EthProvider';
import { NotificationType, openNotification } from '@/utils/notification';

export default function useMeasure() {
    const dispatch = useDispatch();
    const { ethUnitService, ethFiatService } = useContext(EthContext);

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [units, setUnits] = useState<string[]>([]);
    const [fiats, setFiats] = useState<string[]>([]);

    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, []);

    const loadData = async () => {
        try {
            dispatch(showLoading('Retrieving measures...'));
            const units = await ethUnitService.getAll();
            setUnits(units);
            const fiats = await ethFiatService.getAll();
            setFiats(fiats);
            setDataLoaded(true);
        } catch (e: any) {
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    return {
        dataLoaded,
        units,
        fiats,
        loadData
    };
}
