// signerSingleton.ts
import { ethers } from 'ethers';
import { store } from '../redux/store';
import {RPC_URL} from "../constants";

// TODO Implementare un signer provider
class SingletonSigner {
    private static instance: ethers.Wallet | null = null;

    public static getInstance(): ethers.Wallet | null {
        if (!SingletonSigner.instance) {
            const state = store.getState();
            console.log("Resetting signer instance with private key", state.userInfo.privateKey)
            const privateKey = state.userInfo.privateKey;
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
            console.log('Provider', provider)
            if (privateKey) {
                SingletonSigner.instance = new ethers.Wallet(privateKey, provider);
            }
        }
        return SingletonSigner.instance;
    }

    public static resetInstance() {
        SingletonSigner.instance = null;
    }
}

export default SingletonSigner;
