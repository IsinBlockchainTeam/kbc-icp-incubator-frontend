import {storage} from "../constants";

export const getUneceAPIToken = (): string | null => {
    return sessionStorage.getItem(storage.UNECE_API_TOKEN);
}

export const toggleBlockchainViewMode = () => {
    const isBlockchainMode = sessionStorage.getItem(storage.BLOCKCHAIN_VIEW_MODE);
    sessionStorage.setItem(storage.BLOCKCHAIN_VIEW_MODE, (!(isBlockchainMode === 'false' ? false : Boolean(isBlockchainMode))).toString());
}

export const isBlockchainViewMode = (): boolean => {
    // TODO: remove comments
    // const isBlockchainMode = sessionStorage.getItem(storage.BLOCKCHAIN_VIEW_MODE);
    // return isBlockchainMode === 'false' ? false : Boolean(isBlockchainMode);
    return true;
}
