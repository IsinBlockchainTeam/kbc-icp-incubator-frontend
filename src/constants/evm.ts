import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const CONTRACT_ADDRESSES = {
    TOKEN: () => checkAndGetEnvironmentVariable(process.env.REACT_APP_TOKEN, 'Token contract address must be defined')
};
