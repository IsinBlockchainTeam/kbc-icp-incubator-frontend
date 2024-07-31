import EthereumProvider from '@walletconnect/ethereum-provider';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createEthereumProvider } from '@/utils/walletConnect';
import { Typography } from 'antd';

export type WalletConnectContextState = {
    provider: EthereumProvider;
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
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
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const provider = await createEthereumProvider();
            setProvider(provider);
        })();
    }, []);

    useEffect(() => {
        if (!provider) return;
        provider.on('disconnect', (args: any) => {
            console.log('disconnect', args);
        });
        provider.on('connect', (args: any) => {
            console.log('event connect');
            console.log('args', args);
            connect();
        });
    }, [provider]);

    const connect = () => {
        setConnected(true);
    };

    const disconnect = async () => {
        if (!provider) return;
        await provider.disconnect();
        setProvider(await createEthereumProvider());
        setConnected(false);
    };

    if (!provider) return <Typography.Text>Rumore di grilli</Typography.Text>;

    return (
        <WalletConnectContext.Provider
            value={{
                provider,
                connected,
                connect,
                disconnect
            }}>
            {children}
        </WalletConnectContext.Provider>
    );
}
