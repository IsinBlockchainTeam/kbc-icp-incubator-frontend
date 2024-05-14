import {createContext, type ReactNode, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../redux/store";
import SingletonSigner from "../api/SingletonSigner";
import {ethers} from "ethers";
import {RPC_URL} from "../constants";

export const SignerContext = createContext<ethers.Wallet | null>(null);

export function SignerProvider({ children }: { children: ReactNode }) {
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [signer, setSigner] = useState<ethers.Wallet | null>(null);

    //TODO: Instead of using SingletonSigner, provide that as hooks
    useEffect(() => {
        console.log("Signer")
        if(userInfo.privateKey) {
            console.log("Initializing signer...")
            SingletonSigner.setInstance(userInfo.privateKey);
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
            setSigner(new ethers.Wallet(userInfo.privateKey, provider));
        }
    }, [userInfo]);

    return (
        <SignerContext.Provider value={signer}>
            {children}
        </SignerContext.Provider>
    );

}
