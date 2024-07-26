import React, { useEffect, useMemo, useState } from 'react';
import { createContext, type ReactNode } from 'react';
import { ethers, Wallet } from 'ethers';
import { Typography } from 'antd';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react';

export type SignerContextState = {
    signer: JsonRpcSigner;
    setSigner: (signer: JsonRpcSigner) => void;
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
    const [signer, setSigner] = useState<JsonRpcSigner | null>();

    const waitForTransactions = async (transactionHash: string, confirmations: number) => {
        await signer!.provider.waitForTransaction(transactionHash, confirmations);
    };
    return (
        <SignerContext.Provider
            value={{
                signer: signer as JsonRpcSigner,
                setSigner,
                waitForTransactions
            }}>
            {children}
        </SignerContext.Provider>
    );
}
