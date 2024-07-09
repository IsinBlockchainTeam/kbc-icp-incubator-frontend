import {checkAndGetEnvironmentVariable} from "@/utils/env";

export const PROJECT_ID = checkAndGetEnvironmentVariable(
    process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
    'Wallet Connect Project ID must be defined'
);
