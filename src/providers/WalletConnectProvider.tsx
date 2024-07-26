import EthereumProvider from '@walletconnect/ethereum-provider';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createEthereumProvider } from '@/utils/walletConnect';
import { Typography } from 'antd';

export type WalletConnectContextState = {
    provider: EthereumProvider;
    setProvider: (provider: EthereumProvider) => void;
    connected: boolean;
    setConnected: (connected: boolean) => void;
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
    // TODO: persist this data between sections
    const [provider, setProvider] = useState<EthereumProvider>();
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            console.log('restoring session');
            const provider = await createEthereumProvider();
            console.log('established provider', provider);
            setProvider(provider);
            setConnected(true);
            console.log('session restored');
        })();
    }, []);

    if (!provider) return <Typography.Text>Rumore di grilli</Typography.Text>;

    return (
        <WalletConnectContext.Provider
            value={{
                provider,
                setProvider,
                connected,
                setConnected
            }}>
            {children}
        </WalletConnectContext.Provider>
    );
}
