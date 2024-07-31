import React, { useEffect, useState } from 'react';
import { createContext, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { Typography } from 'antd';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWalletConnect } from '@/providers/WalletConnectProvider';

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
    const { provider } = useWalletConnect();
    const [signer, setSigner] = useState<JsonRpcSigner>();

    useEffect(() => {
        if (!provider) {
            setSigner(undefined);
            return;
        }

        (async () => {
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const account = await ethersProvider.getSigner().getAddress();
            setSigner(ethersProvider.getSigner(account));
        })();
    }, [provider]);

    const waitForTransactions = async (transactionHash: string, confirmations: number) => {
        await signer!.provider.waitForTransaction(transactionHash, confirmations);
    };

    if (!signer) return <Typography.Text>Signer not initialized</Typography.Text>;

    return (
        <SignerContext.Provider
            value={{
                signer: signer,
                waitForTransactions
            }}>
            {children}
        </SignerContext.Provider>
    );
}
