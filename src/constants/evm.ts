import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const CONTRACT_ADDRESSES = {
    PROCESS_TYPE: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_PROCESS_TYPE,
            'Process type contract address must be defined'
        ),
    UNIT: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_UNIT,
            'Unit contract address must be defined'
        ),
    FIAT: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_FIAT,
            'Fiat contract address must be defined'
        ),
    TOKEN: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_TOKEN,
            'Token contract address must be defined'
        )
};
