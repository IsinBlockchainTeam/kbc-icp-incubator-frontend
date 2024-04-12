import {storage} from "../constants";

export const getUneceAPIToken = (): string | null => {
    return sessionStorage.getItem(storage.UNECE_API_TOKEN);
}


export const setWalletAddress = (address: string) => {
    sessionStorage.setItem(storage.WALLET_ADDRESS, address);
}

export const unsetWalletAddress = () => {
    sessionStorage.removeItem(storage.WALLET_ADDRESS);
}

export const getWalletAddress = (): string | null => {
    return sessionStorage.getItem(storage.WALLET_ADDRESS);
}

export const toggleBlockchainViewMode = () => {
    const isBlockchainMode = sessionStorage.getItem(storage.BLOCKCHAIN_VIEW_MODE);
    sessionStorage.setItem(storage.BLOCKCHAIN_VIEW_MODE, (!(isBlockchainMode === 'false' ? false : Boolean(isBlockchainMode))).toString());
}

export const isBlockchainViewMode = (): boolean => {
    const isBlockchainMode = sessionStorage.getItem(storage.BLOCKCHAIN_VIEW_MODE);
    return isBlockchainMode === 'false' ? false : Boolean(isBlockchainMode);
}
