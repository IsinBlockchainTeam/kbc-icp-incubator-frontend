import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/index';
import { URL_SEGMENTS } from '@kbc-lib/coffee-trading-management-lib';

export const getICPCanisterURL = (canisterId: string): string => {
    return checkAndGetEnvironmentVariable(ICP.DFX_NETWORK) === 'local'
        ? URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.LOCAL_REPLICA
        : URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.MAINNET;
};
