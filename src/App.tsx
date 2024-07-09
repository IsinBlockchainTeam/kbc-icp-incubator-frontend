import React from 'react';
import { Worker } from '@react-pdf-viewer/core';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import Profile from '@/pages/Profile/Profile';
import Partners from '@/pages/Partner/Partners';
import Offers from '@/pages/Offer/Offers';
import OfferNew from '@/pages/Offer/OfferNew';
import OfferSupplierNew from '@/pages/Offer/OfferSupplierNew';
import Materials from '@/pages/Material/Materials';
import MaterialNew from '@/pages/Material/MaterialNew';
import ProductCategoryNew from '@/pages/Material/ProductCategoryNew';
import Trades from '@/pages/Trade/Trades';
import { TradeNew } from '@/pages/Trade/New/TradeNew';
import TradeView from '@/pages/Trade/View/TradeView';
import AssetOperations from '@/pages/AssetOperation/AssetOperations';
import AssetOperationNew from '@/pages/AssetOperation/AssetOperationNew';
import GraphPage from '@/pages/Graph/GraphPage';
import Login from '@/pages/Login/Login';
import { Provider as ReduxProvider } from 'react-redux/es/exports';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { MenuLayout } from '@/components/structure/MenuLayout/MenuLayout';
import { paths } from '@/constants/paths';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import {RPC_URL} from "@/constants/evm";

// 1. Get projectId
const projectId = 'e55dee800a9c2117a91613b30aa697ee'

// 2. Set chains
// const chain = {
//     chainId: 222,
//     name: '3A Chain',
//     currency: 'ETH',
//     explorerUrl: 'https://etherscan.io',
//     rpcUrl: RPC_URL,
// }
const chain = {
    chainId: 11155111,
    name: 'Sepolia Infura',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: "https://sepolia.infura.io/v3/f34b1619ac084f5280a31c5bcdbfdd9e",
}

// 3. Create a metadata object
const metadata = {
    name: 'KBC platform',
    description: 'A portal to decentralized coffee trading',
    url: 'http://192.168.0.173:3000',
    icons: ['https://upload.wikimedia.org/wikipedia/commons/9/9c/Dunder_Mifflin%2C_Inc.svg']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
})

// 5. Create a Web3Modal instance
createWeb3Modal({
    ethersConfig,
    chains: [chain],
    projectId,
});

export const App = () => {
    return (
        <HashRouter>
            <ReduxProvider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
                        <Routes>
                            <Route element={<MenuLayout />}>
                                <Route element={<PrivateRoutes />}>
                                    <Route index path={paths.PROFILE} element={<Profile />} />
                                    <Route path={paths.PARTNERS} element={<Partners />} />
                                    <Route path={paths.OFFERS} element={<Offers />} />
                                    <Route path={paths.OFFERS_NEW} element={<OfferNew />} />
                                    <Route
                                        path={paths.OFFERS_SUPPLIER_NEW}
                                        element={<OfferSupplierNew />}
                                    />
                                    <Route path={paths.MATERIALS} element={<Materials />} />
                                    <Route path={paths.MATERIAL_NEW} element={<MaterialNew />} />
                                    <Route
                                        path={paths.PRODUCT_CATEGORY_NEW}
                                        element={<ProductCategoryNew />}
                                    />
                                    <Route path={paths.TRADES} element={<Trades />} />
                                    <Route path={paths.TRADE_NEW} element={<TradeNew />} />
                                    <Route path={paths.TRADE_VIEW} element={<TradeView />} />
                                    <Route
                                        path={paths.ASSET_OPERATIONS}
                                        element={<AssetOperations />}
                                    />
                                    <Route
                                        path={paths.ASSET_OPERATIONS_NEW}
                                        element={<AssetOperationNew />}
                                    />
                                    <Route path={paths.GRAPH} element={<GraphPage />} />
                                </Route>
                                <Route path={paths.LOGIN} element={<Login />} />
                                <Route path="*" element={<Navigate to={paths.LOGIN} />} />
                            </Route>
                        </Routes>
                    </Worker>
                </PersistGate>
            </ReduxProvider>
        </HashRouter>
    );
};

export default App;
