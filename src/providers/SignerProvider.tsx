import React, { useMemo } from 'react';
import { createContext, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { Typography } from 'antd';
import { useWeb3ModalProvider } from '@web3modal/ethers5/react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';

export type SignerContextState = {
    signer: JsonRpcSigner;
    waitForTransactions: (transactionHash: string, confirmations: number) => Promise<void>;
};
export const SignerContext = createContext<SignerContextState>({} as SignerContextState);
export const useSigner = (): SignerContextState => {
    const context = React.useContext(SignerContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useSigner must be used within an SignerProvider.');
    }
    return context;
};
export function SignerProvider({ children }: { children: ReactNode }) {
    const { address } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const signer = useMemo(
        () => {
            if(!walletProvider || !address) return signer;
            const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
            return ethersProvider.getSigner(address);
            },
        [walletProvider, address]
    );

    const waitForTransactions = async (transactionHash: string, confirmations: number) => {
        await signer.provider.waitForTransaction(transactionHash, confirmations);
    };

    if (!signer) {
        return <Typography.Text>User is not logged in</Typography.Text>;
    }
    return (
        <SignerContext.Provider
            value={{
                signer,
                waitForTransactions
            }}>
            {children}
        </SignerContext.Provider>
    );
}
