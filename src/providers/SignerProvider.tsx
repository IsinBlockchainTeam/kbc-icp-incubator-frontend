import React from "react";
import {createContext, type ReactNode, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {ethers} from "ethers";
import {RPC_URL} from "../constants";

type SignerContextState = {
    signer: ethers.Wallet
}
export const SignerContext = createContext<SignerContextState>({} as SignerContextState);

export function SignerProvider({ children }: { children: ReactNode }) {
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const signer = new ethers.Wallet(userInfo.privateKey, new ethers.providers.JsonRpcProvider(RPC_URL));

    return (
        <SignerContext.Provider value={{
            signer
        }}>
            {children}
        </SignerContext.Provider>
    );

}
