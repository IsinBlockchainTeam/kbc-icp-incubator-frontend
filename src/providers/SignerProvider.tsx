import {createContext, type ReactNode, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {ethers} from "ethers";
import {RPC_URL} from "../constants";

type SignerContextState = {
    signer: ethers.Wallet | null
}

const initialState: SignerContextState = {
    signer: null
}
export const SignerContext = createContext<SignerContextState>(initialState);

export function SignerProvider({ children }: { children: ReactNode }) {
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [signer, setSigner] = useState<ethers.Wallet | null>(null);

    useEffect(() => {
        if(userInfo.privateKey) {
            console.log("Initializing signer...")
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
            setSigner(new ethers.Wallet(userInfo.privateKey, provider));
        } else {
            setSigner(null);
        }
    }, [userInfo]);

    return (
        <SignerContext.Provider value={{
            signer
        }}>
            {children}
        </SignerContext.Provider>
    );

}
