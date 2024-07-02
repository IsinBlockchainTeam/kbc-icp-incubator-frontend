import { createContext, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { EnumerableTypeReadDriver, EnumerableTypeService } from '@blockchain-lib/common';
import { contractAddresses } from '@/constants/evm';
import { FIAT_MESSAGE, PROCESS_TYPE_MESSAGE, UNIT_MESSAGE } from '@/constants/message';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';

export type EthEnumerableContextState = {
    dataLoaded: boolean;
    fiats: string[];
    processTypes: string[];
    units: string[];
    loadData: () => Promise<void>;
};
export const EthEnumerableContext = createContext<EthEnumerableContextState>(
    {} as EthEnumerableContextState
);
export const useEthEnumerable = (): EthEnumerableContextState => {
    const context = useContext(EthEnumerableContext);
    if (!context) {
        throw new Error('useEthEnumerable must be used within an EthEnumerableProvider.');
    }
    return context;
};
export function EthEnumerableProvider(props: { children: React.ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [fiats, setFiats] = useState<string[]>([]);
    const [processTypes, setProcessTypes] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    const fiatService = useMemo(
        () =>
            new EnumerableTypeService(
                new EnumerableTypeReadDriver(signer, contractAddresses.FIAT())
            ),
        [signer]
    );
    const processTypeService = useMemo(
        () =>
            new EnumerableTypeService(
                new EnumerableTypeReadDriver(signer, contractAddresses.PROCESS_TYPE())
            ),
        [signer]
    );
    const unitService = useMemo(
        () =>
            new EnumerableTypeService(
                new EnumerableTypeReadDriver(signer, contractAddresses.UNIT())
            ),
        [signer]
    );

    const loadFiats = async () => {
        try {
            dispatch(addLoadingMessage(FIAT_MESSAGE.RETRIEVE.LOADING));
            const fiats = await fiatService.getTypesList();
            setFiats(fiats);
        } catch (e) {
            openNotification(
                'Error',
                FIAT_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(FIAT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadProcessTypes = async () => {
        try {
            dispatch(addLoadingMessage(PROCESS_TYPE_MESSAGE.RETRIEVE.LOADING));
            const processTypes = await processTypeService.getTypesList();
            setProcessTypes(processTypes);
        } catch (e) {
            openNotification(
                'Error',
                PROCESS_TYPE_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(PROCESS_TYPE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadUnits = async () => {
        try {
            dispatch(addLoadingMessage(UNIT_MESSAGE.RETRIEVE.LOADING));
            const units = await unitService.getTypesList();
            setUnits(units);
        } catch (e) {
            openNotification(
                'Error',
                UNIT_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(UNIT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await Promise.all([loadFiats(), loadProcessTypes(), loadUnits()]);
        setDataLoaded(true);
    };

    return (
        <EthEnumerableContext.Provider
            value={{
                dataLoaded,
                fiats,
                processTypes,
                units,
                loadData
            }}>
            {props.children}
        </EthEnumerableContext.Provider>
    );
}
