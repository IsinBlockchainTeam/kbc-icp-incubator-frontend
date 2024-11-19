import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const requestPath = {
    VERIFIER_BACKEND_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_VERIFIER_BACKEND_URL, 'Veramo proxy URL must be defined')}/api/verifier`,
    EMAIL_SENDER_URL: `${checkAndGetEnvironmentVariable(process.env.REACT_APP_EMAIL_SENDER_URL, 'Email sender service URL must be defined')}`
};
