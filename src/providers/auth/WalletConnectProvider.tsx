import EthereumProvider from '@walletconnect/ethereum-provider';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createEthereumProvider } from '@/utils/walletConnect';

export type WalletConnectContextState = {
    provider: EthereumProvider | undefined;
    disconnect: () => Promise<void>;
};
export const WalletConnectContext = createContext<WalletConnectContextState>(
    {} as WalletConnectContextState
);
export const useWalletConnect = (): WalletConnectContextState => {
    const context = useContext(WalletConnectContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useWalletConnect must be used within an WalletConnectProvider.');
    }
    return context;
};
export function WalletConnectProvider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<EthereumProvider>();

    useEffect(() => {
        (async () => {
            const provider = await createEthereumProvider();
            setProvider(provider);
        })();
    }, []);

    const disconnect = async () => {
        if (!provider) return;
        await provider.disconnect();
        setProvider(await createEthereumProvider());
    };

    return (
        <WalletConnectContext.Provider
            value={{
                provider,
                disconnect
            }}>
            {children}
        </WalletConnectContext.Provider>
    );
}
