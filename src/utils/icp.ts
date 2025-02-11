import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { URL_SEGMENTS } from '@kbc-lib/coffee-trading-management-lib';
import { ICP } from '@/constants/icp';

export const getICPCanisterURL = (canisterId: string): string => {
    return checkAndGetEnvironmentVariable(ICP.DFX_NETWORK) === 'local'
        ? URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.LOCAL_REPLICA
        : URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.MAINNET;
};
