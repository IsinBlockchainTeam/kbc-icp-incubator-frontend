import React, { useEffect, useState } from 'react';
import { createContext, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { Typography } from 'antd';
import { useWeb3ModalProvider } from '@web3modal/ethers5/react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';

export type SignerContextState = {
    signer: JsonRpcSigner;
};
export const SignerContext = createContext<SignerContextState>({} as SignerContextState);

export function SignerProvider({ children }: { children: ReactNode }) {
    const [signer, setSigner] = useState<JsonRpcSigner>();
    const { address } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    useEffect(() => {
        if (!walletProvider || !address) return;
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
        const signer = ethersProvider.getSigner(address);
        setSigner(signer);
    }, [walletProvider, address]);

    if (!signer) {
        return <Typography.Text>User is not logged in</Typography.Text>;
    }
    return (
        <SignerContext.Provider
            value={{
                signer: signer
            }}>
            {children}
        </SignerContext.Provider>
    );
}
