import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const ICP = {
    DFX_NETWORK: checkAndGetEnvironmentVariable(
        process.env.DFX_NETWORK,
        'DFX network must be defined'
    ),
    CANISTER_ID_STORAGE: checkAndGetEnvironmentVariable(
        process.env.REACT_APP_CANISTER_ID_STORAGE,
        'Storage canister ID must be defined'
    ),
    CANISTER_ID_PERMISSION: checkAndGetEnvironmentVariable(
        process.env.REACT_APP_CANISTER_ID_PERMISSION,
        'Permission canister ID must be defined'
    ),
    CANISTER_ID_ORGANIZATION: checkAndGetEnvironmentVariable(
        process.env.REACT_APP_CANISTER_ID_ORGANIZATION,
        'Organization canister ID must be defined'
    ),
    CANISTER_ID_IC_SIWE_PROVIDER: checkAndGetEnvironmentVariable(
        process.env.REACT_APP_CANISTER_ID_IC_SIWE_PROVIDER,
        'IC SIWE provider canister ID must be defined'
    )
};
