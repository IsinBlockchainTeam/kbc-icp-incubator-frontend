// signerSingleton.ts
import {ethers} from 'ethers';
import {store} from '../redux/store';

// TODO Implementare un signer provider
class SingletonSigner {
    private static signer: ethers.providers.JsonRpcSigner | null = null;
    private static address: string | null = null;

    public static getSigner(): ethers.providers.JsonRpcSigner | null {
        if (!SingletonSigner.signer) {
            const state = store.getState();
            const provider = state.walletConnect.walletProvider;
            if(!provider)
                throw new Error("Wallet is not connected");

            SingletonSigner.signer = provider.getSigner();
        }
        return SingletonSigner.signer;
    }

    public static getSignerAddress(): string | null {
        if(SingletonSigner.address) {
            const state = store.getState();
            const address = state.walletConnect.address;
            if(!address)
                throw new Error("Wallet address is not set");

            SingletonSigner.address = address;
        }
        return SingletonSigner.address;
    }
}

export default SingletonSigner;
