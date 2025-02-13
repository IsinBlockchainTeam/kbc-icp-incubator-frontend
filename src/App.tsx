import React from 'react';
import { Worker } from '@react-pdf-viewer/core';
import { HashRouter, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './routes/private/PrivateRoutes';
import { Provider as ReduxProvider } from 'react-redux/es/exports';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { PageLayout } from '@/layout/PageLayout/PageLayout';
import { WalletConnectProvider } from '@/providers/auth/WalletConnectProvider';
import publicRoutes from './routes/public/public.routes';
import privateRoutes from './routes/private/private.routes';
import PublicRoutes from './routes/public/PublicRoutes';

export const App = () => {
    return (
        <HashRouter>
            <ReduxProvider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
                        <WalletConnectProvider>
                            <Routes>
                                <Route element={<PageLayout />}>
                                    <Route element={<PrivateRoutes />}>{privateRoutes}</Route>
                                    <Route element={<PublicRoutes />}>{publicRoutes}</Route>
                                </Route>
                            </Routes>
                        </WalletConnectProvider>
                    </Worker>
                </PersistGate>
            </ReduxProvider>
        </HashRouter>
    );
};

export default App;
