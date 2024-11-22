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
    '0x319FFED7a71D3CD22aEEb5C815C88f0d2b19D123',
    '0xa1f48005f183780092E0E277B282dC1934AE3308',
    // TO REMOVE: this is a fake address, that is used to simulate the arbiter organization.
    '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f'
];

const mockedCompanies = new Map<string, CompanyInfo>([
    [
        ADDRESSES[0],
        {
            id: '123456789',
            legalName: 'EuroCoffee Imports Ltd',
            address: 'Rue des Commerçants, 567',
            city: 'Bruxelles',
            postalCode: '1040',
            region: '1040 Bruxelles',
            countryCode: 'BE',
            role: 'Importer',
            telephone: '123456789',
            email: 'importer@coffe.com',
            image: 'importer.jpg'
        }
    ],
    [
        ADDRESSES[1],
        {
            id: 'BR33454198',
            legalName: 'Brazil Exporter',
            address: 'Exporter Street 2',
            city: 'Sao Paulo',
            postalCode: '12345',
            region: '03506-000 - São Paulo',
            countryCode: 'BRA',
            role: 'Exporter',
            telephone: '987654321',
            email: 'exporter@coffe.com',
            image: 'exporter.jpg'
        }
    ],
    [
        ADDRESSES[2],
        {
            id: '987654321',
            legalName: 'Arbiter',
            address: 'Arbiter Street 3',
            city: 'Luzern',
            postalCode: '6005',
            region: '6005 Luzern',
            countryCode: 'CH',
            role: 'Arbiter',
            telephone: '123456789',
            email: 'arbiter@coffe.com',
            image: 'arbiter.jpg'
        }
    ]
]);

const mockedEmployees = new Map<string, EmployeeInfo>([
    [
        ADDRESSES[0],
        {
            name: 'Marie',
            lastname: 'Dupont',
            telephone: '+32 2 123 4567',
            email: 'marie.dupont@eurocoffeeimports.eu'
        }
    ],
    [
        ADDRESSES[1],
        {
            name: 'João Silva',
            lastname: 'Oliveira',
            telephone: '+55 11 98765-4321',
            email: 'joao.oliveira@cafebrasilexport.com.br'
        }
    ],
    [
        ADDRESSES[2],
        {
            name: 'Arbiter',
            lastname: 'Doe',
            telephone: '123456789',
            email: 'employee1_arbiter@coffe.com'
        }
    ]
]);

export type CompanyInfo = {
    id: string; // could be VAT number of the company or the GS1 ID
    legalName: string;
    address: string;
    postalCode: string;
    city: string;
    region: string; // region name with region code
    countryCode: string;
    role: string;
    telephone: string;
    email: string;
    image: string;
};

// TODO: dato un employee ho delle informazioni che mi permettono di recuperare la company?
export type EmployeeInfo = {
    name: string;
    lastname: string;
    telephone: string;
    email: string;
};

export type ICPOrganizationContextState = {
    dataLoaded: boolean;
    getCompany: (address: string) => CompanyInfo;
    getEmployee: (address: string) => EmployeeInfo;
    loadData: () => Promise<void>;
};
export const ICPOrganizationContext = createContext<ICPOrganizationContextState>({} as ICPOrganizationContextState);
export const useICPOrganization = (): ICPOrganizationContextState => {
    const context = useContext(ICPOrganizationContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useICPOrganization must be used within an ICPOrganizationProvider.');
    }
    return context;
};
export function ICPOrganizationProvider(props: { children: React.ReactNode }) {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [companies, setCompanies] = useState<Map<string, CompanyInfo>>(new Map<string, CompanyInfo>());
    const emptyCompany: CompanyInfo = {
        id: 'Unknown',
        legalName: 'Unknown',
        address: 'Unknown',
        city: 'Unknown',
        postalCode: 'Unknown',
        region: 'Unknown',
        countryCode: 'Unknown',
        role: 'Unknown',
        telephone: 'Unknown',
        email: 'Unknown',
        image: 'Unknown'
    };

    const { organizationDriver } = useICP();
    const dispatch = useDispatch();

    const getCompany = (address: string): CompanyInfo => {
        return companies.get(address) || emptyCompany;
    };

    const getEmployee = (address: string): EmployeeInfo => {
        return mockedEmployees.get(address) || ({} as EmployeeInfo);
    };

    // TODO: le info degli employee vengono recuperate relative alla compagnia (recupero prima la credenziale della company e poi del dipendente)?
    // oppure sono "slegate" e vengono recuperate direttamente dal DID del dipendente?
    const getEmployeeByDID = async (did: string): Promise<EmployeeInfo> => {
        return {} as EmployeeInfo;
    };

    const getCompanyByDID = async (did: string): Promise<CompanyInfo> => {
        let serviceUrl;

        try {
            const didDocument = await request(`${requestPath.VERIFIER_BACKEND_URL}/identifiers/resolve?did-url=${did}`, {
                method: 'GET'
            });
            serviceUrl = didDocument.didDocument.service[0].serviceEndpoint;
        } catch (e) {
            return emptyCompany;
        }
        const canisterId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.CANISTER_ID].split('.')[0];
        if (canisterId != ICP.CANISTER_ID_ORGANIZATION) {
            return emptyCompany;
        }
        const organizationId = serviceUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID];
        let verifiablePresentation;
        try {
            verifiablePresentation = await organizationDriver.getVerifiablePresentation(organizationId);
        } catch (e) {
            return emptyCompany;
        }
        return {
            id: verifiablePresentation.id,
            legalName: verifiablePresentation.legalName,
            address: verifiablePresentation.address,
            city: verifiablePresentation.city,
            postalCode: verifiablePresentation.postalCode,
            region: verifiablePresentation.region,
            countryCode: verifiablePresentation.countryCode,
            role: verifiablePresentation.role,
            telephone: verifiablePresentation.telephone,
            email: verifiablePresentation.email,
            image: verifiablePresentation.logoImage
        };
    };

    const loadOrganizations = async () => {
        dispatch(addLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
        const organizations = new Map<string, CompanyInfo>();
        for (const address of ADDRESSES) {
            // TODO: remove mocked organizations
            organizations.set(address, mockedCompanies.get(address) || emptyCompany);
            // organizations.set(address, await getCompanyByDID(DID_METHOD + ':' + address));
        }
        setCompanies(organizations);
        dispatch(removeLoadingMessage(NAME_MESSAGE.RETRIEVE.LOADING));
    };

    const loadData = async () => {
        await loadOrganizations();
        setDataLoaded(true);
    };

    return (
        <ICPOrganizationContext.Provider value={{ dataLoaded, getCompany, getEmployee, loadData }}>{props.children}</ICPOrganizationContext.Provider>
    );
}
