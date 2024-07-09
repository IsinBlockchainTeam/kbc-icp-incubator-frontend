import React, {useEffect, useState} from 'react';
import { createContext, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ethers } from 'ethers';
import { Typography } from 'antd';
import { RPC_URL } from '@/constants/evm';
import {useWeb3ModalProvider} from "@web3modal/ethers5/react";
import {JsonRpcSigner} from "@ethersproject/providers";

export type SignerContextState = {
    signer: JsonRpcSigner;
};
export const SignerContext = createContext<SignerContextState>({} as SignerContextState);

export function SignerProvider({ children }: { children: ReactNode }) {
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [signer, setSigner] = useState<JsonRpcSigner>();
    const { walletProvider } = useWeb3ModalProvider();

    useEffect(() => {
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider!);
        setSigner(ethersProvider.getSigner());
        console.log("signer:", ethersProvider.getSigner())
    }, [walletProvider]);

    if (!userInfo.isLogged || !signer) {
        return <Typography.Text>User is not logged in</Typography.Text>;
    }
    return (
        <SignerContext.Provider
            value={{
                // signer: new ethers.Wallet(
                //     userInfo.privateKey,
                //     new ethers.providers.JsonRpcProvider(RPC_URL)
                // )
                signer: signer
            }}>
            {children}
        </SignerContext.Provider>
    );
}
