import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { ICPIdentityDriver, ICPOrganizationDriver, ICPStorageDriver } from '@blockchain-lib/common';
import { ICPFileDriver, URL_SEGMENT_INDEXES } from '@kbc-lib/coffee-trading-management-lib';
import { request } from '@/utils/request';
import { requestPath } from '@/constants/url';

export function useICPDrivers() {
    const { identity } = useSiweIdentity();
    if (!identity) {
        return;
    }

    const driverCanisterIds = {
        organization: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ORGANIZATION),
        storage: checkAndGetEnvironmentVariable(ICP.CANISTER_ID_STORAGE)
    };

    const icpOrganizationDriver = new ICPOrganizationDriver(
        identity,
        driverCanisterIds.organization
    );
    const icpStorageDriver = new ICPStorageDriver(identity, driverCanisterIds.storage);
    const icpFileDriver = new ICPFileDriver(icpStorageDriver);
    const icpIdentityDriver = new ICPIdentityDriver(identity);
    const getNameByDID = async (did: string): Promise<string> => {
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
                await icpOrganizationDriver.getVerifiablePresentation(organizationId);
        } catch (e) {
            console.log('Error getting verifiable presentation');
            return 'Unknown';
        }
        return verifiablePresentation.legalName;
    };
    return {
        icpOrganizationDriver,
        icpStorageDriver,
        icpFileDriver,
        icpIdentityDriver,
        getNameByDID
    };
}
