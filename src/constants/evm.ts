import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const RPC_URL = checkAndGetEnvironmentVariable(
    process.env.REACT_APP_RPC_URL,
    'RPC URL must be defined'
);
export const CHAIN_ID = (): number => {
    const chainId = checkAndGetEnvironmentVariable(
        process.env.REACT_APP_CHAIN_ID,
        'Chain ID must be defined'
    );
    try {
        return parseInt(chainId);
    } catch (e) {
        throw new Error('Chain ID must be a number');
    }
};
export const CHAIN_NAME = (): string => {
    try {
        return checkAndGetEnvironmentVariable(process.env.REACT_APP_CHAIN_NAME);
    } catch (e) {
        return 'Unknown Chain';
    }
};
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
    ASSESSMENT_STANDARD: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_ASSESSMENT_STANDARD,
            'Assessment standard contract address must be defined'
        ),
    PRODUCT_CATEGORY: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_PRODUCT_CATEGORY,
            'Product category contract address must be defined'
        ),
    RELATIONSHIP: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_RELATIONSHIP,
            'Relationship contract address must be defined'
        ),
    MATERIAL: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_MATERIAL,
            'Material contract address must be defined'
        ),
    TRADE: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_TRADE,
            'Trade contract address must be defined'
        ),
    ASSET_OPERATION: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_ASSET_OPERATION,
            'Transformation contract address must be defined'
        ),
    DOCUMENT: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_DOCUMENT,
            'Document contract address must be defined'
        ),
    OFFER: () =>
        checkAndGetEnvironmentVariable(
            process.env.REACT_APP_CONTRACT_OFFER,
            'Offer contract address must be defined'
        )
};
