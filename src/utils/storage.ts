import {storage} from "../constants";
import {SolidToken} from "@blockchain-lib/common";

export const getUneceAPIToken = (): string | null => {
    return sessionStorage.getItem(storage.UNECE_API_TOKEN);
}


export const getSolidAPIToken = async (): Promise<SolidToken | null> => {
    const token = sessionStorage.getItem(storage.SOLID_API_TOKEN);
    if (!token) return null;
    const solidToken = JSON.parse(token);
    const keyPair = await window.crypto.subtle.generateKey(solidToken.dpopKey.privateKey.algorithm, solidToken.dpopKey.privateKey.extractable, solidToken.dpopKey.privateKey.usages)
    return {...solidToken, dpopKey: {...solidToken.dpopKey, privateKey: keyPair.privateKey}};
}

export const setSolidAPIToken = (token: SolidToken) => {
    let dpopPrivateKey = token.dpopKey.privateKey as CryptoKey;
    const privateKey = {
        algorithm: dpopPrivateKey.algorithm,
        extractable: dpopPrivateKey.extractable,
        type: dpopPrivateKey.type,
        usages: dpopPrivateKey.usages,
    }
    sessionStorage.setItem(storage.SOLID_API_TOKEN, JSON.stringify({...token, dpopKey: {...token.dpopKey, privateKey}}));
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
