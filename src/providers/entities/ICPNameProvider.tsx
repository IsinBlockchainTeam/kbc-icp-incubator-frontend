import { createContext, useContext, useState } from 'react';
import { NAME_MESSAGE } from '@/constants/message';
import { useDispatch } from 'react-redux';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { useICP } from '@/providers/ICPProvider';
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

export type OrganizationInfo = {
    legalName: string;
    address: string;
    nation: string;
    role: string;
    telephone: string;
    email: string;
    image: string;
};

export type ICPOrganizationContextState = {
    dataLoaded: boolean;
    getOrganization: (address: string) => OrganizationInfo;
    loadData: () => Promise<void>;
};
export const ICPOrganizationContext = createContext<ICPOrganizationContextState>(
    {} as ICPOrganizationContextState
);
export const useICPName = (): ICPOrganizationContextState => {
    const context = useContext(ICPOrganizationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useICPName must be used within an ICPNameProvider.');
    }
    return context;
};
export function ICPNameProvider(props: { children: React.ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [organizations, setOrganizations] = useState<Map<string, OrganizationInfo>>(
        new Map<string, OrganizationInfo>()
    );
    const emptyOrganization: OrganizationInfo = {
        legalName: 'Unknown',
        address: 'Unknown',
        nation: 'Unknown',
        role: 'Unknown',
        telephone: 'Unknown',
        email: 'Unknown',
        image: 'Unknown'
    };

    const { organizationDriver } = useICP();
    const dispatch = useDispatch();

    const getOrganization = (address: string): OrganizationInfo => {
        return organizations.get(address) || emptyOrganization;
    };

    const getOrganizationsByDID = async (did: string): Promise<OrganizationInfo> => {
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
            return emptyOrganization;
        }
        const canisterId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.CANISTER_ID].split('.')[0];
        if (canisterId != ICP.CANISTER_ID_ORGANIZATION) {
            return emptyOrganization;
        }
        const organizationId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID];
        let verifiablePresentation;
        try {
            verifiablePresentation =
                await organizationDriver.getVerifiablePresentation(organizationId);
        } catch (e) {
            return emptyOrganization;
        }
        return {
            legalName: verifiablePresentation.legalName,
            address: 'fake address',
            nation: 'fake nation',
            role: 'fake role',
            telephone: 'fake telephone',
            email: 'fake_email@email.ch',
            image: 'company logo'
        };
    };

    const loadOrganizations = async () => {
        dispatch(addLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
        const organizations = new Map<string, OrganizationInfo>();
        for (const address of ADDRESSES) {
            organizations.set(address, await getOrganizationsByDID(DID_METHOD + ':' + address));
        }
        setOrganizations(organizations);
        dispatch(removeLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
    };

    const loadData = async () => {
        await loadOrganizations();
        setDataLoaded(true);
    };

    return (
        <ICPOrganizationContext.Provider value={{ dataLoaded, getOrganization, loadData }}>
            {props.children}
        </ICPOrganizationContext.Provider>
    );
}
