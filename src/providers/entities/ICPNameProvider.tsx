import { createContext, useContext, useState } from 'react';
import { NotificationType, openNotification } from '@/utils/notification';
import { NAME_MESSAGE } from '@/constants/message';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { ICPContext } from '@/providers/ICPProvider';
import { DID_METHOD } from '@/constants/ssi';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';
import { URL_SEGMENT_INDEXES } from '@kbc-lib/coffee-trading-management-lib';
import { ICP } from '@/constants/icp';

// TODO: fix this by retrieving the names from the blockchain
const ADDRESSES = [
    '0xa1f48005f183780092E0E277B282dC1934AE3308',
    '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123'
];
export type ICPNameContextState = {
    dataLoaded: boolean;
    getName: (address: string) => string;
    loadData: () => Promise<void>;
};
export const ICPNameContext = createContext<ICPNameContextState>({} as ICPNameContextState);
export const useICPName = (): ICPNameContextState => {
    const context = useContext(ICPNameContext);
    if (!context) {
        throw new Error('useICPName must be used within an ICPNameProvider.');
    }
    return context;
};
export function ICPNameProvider(props: { children: React.ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [names, setNames] = useState<Map<string, string>>(new Map<string, string>());

    const { organizationDriver } = useContext(ICPContext);
    const dispatch = useDispatch();

    const getName = (address: string) => {
        return names.get(address) || 'Unknown';
    };

    const getNameByDID = async (did: string) => {
        let serviceUrl;
        try {
            const didDocument = await request(
                `${requestPath.VERIFIER_BACKEND_URL}/identifiers/resolve?did-url=${did}`,
                {
                    method: 'GET'
                }
            );
            serviceUrl = didDocument.didDocument.service[0].serviceEndpoint;
        } catch (e) {
            console.log('Error getting service URL');
            return 'Unknown';
        }
        const canisterId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.CANISTER_ID].split('.')[0];
        if (canisterId != ICP.CANISTER_ID_ORGANIZATION) {
            console.log('Unknown canister ID');
            return 'Unknown';
        }
        const organizationId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID];
        let verifiablePresentation;
        try {
            verifiablePresentation =
                await organizationDriver.getVerifiablePresentation(organizationId);
        } catch (e) {
            console.log('Error getting verifiable presentation');
            return 'Unknown';
        }
        return verifiablePresentation.legalName;
    };

    const loadNames = async () => {
        try {
            dispatch(addLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
            const names = new Map<string, string>();
            for (const address of ADDRESSES) {
                names.set(address, await getNameByDID(DID_METHOD + ':' + address));
            }
            setNames(names);
        } catch (e: any) {
            openNotification(
                'Error',
                NAME_MESSAGE.RETRIEVE.ERROR,
                NotificationType.ERROR,
                NOTIFICATION_DURATION
            );
        } finally {
            dispatch(removeLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await loadNames();
        setDataLoaded(true);
    };

    return (
        <ICPNameContext.Provider value={{ dataLoaded, getName, loadData }}>
            {props.children}
        </ICPNameContext.Provider>
    );
}
