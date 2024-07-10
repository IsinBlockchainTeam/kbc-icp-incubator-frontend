import React, { useMemo } from 'react';
import { createContext, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ethers } from 'ethers';
import { Typography } from 'antd';
import { RPC_URL } from '@/constants/evm';

export type SignerContextState = {
    signer: ethers.Wallet;
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
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const signer = useMemo(
        () => new ethers.Wallet(userInfo.privateKey, new ethers.providers.JsonRpcProvider(RPC_URL)),
        [userInfo]
    );

    const waitForTransactions = async (transactionHash: string, confirmations: number) => {
        await signer.provider.waitForTransaction(transactionHash, confirmations);
    };

    if (!userInfo.isLogged) {
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
