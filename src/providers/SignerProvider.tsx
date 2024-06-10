import React from "react";
import {createContext, type ReactNode} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {ethers} from "ethers";
import {RPC_URL} from "@/constants/index";
import {Typography} from "antd";

type SignerContextState = {
    signer: ethers.Wallet
}
export const SignerContext = createContext<SignerContextState>({} as SignerContextState);

export function SignerProvider({ children }: { children: ReactNode }) {
    const userInfo = useSelector((state: RootState) => state.userInfo);

    if(!userInfo.isLogged) {
        return <Typography.Text>
            User is not logged in
        </Typography.Text>
    }
    return (
        <SignerContext.Provider value={{
            signer: new ethers.Wallet(userInfo.privateKey, new ethers.providers.JsonRpcProvider(RPC_URL))
        }}>
            {children}
        </SignerContext.Provider>
    );

}
