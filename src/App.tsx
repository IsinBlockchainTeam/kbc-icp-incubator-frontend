import React from "react";
import { Worker } from "@react-pdf-viewer/core";
import {Navigate, Route, Routes} from 'react-router-dom'
import {MenuLayout} from "./components/structure/MenuLayout/MenuLayout";
import PrivateRoutes from "./PrivateRoutes";
import Home from "./pages/Home/Home";
import {paths} from "./constants";
import Profile from "./pages/Profile/Profile";
import Partners from "./pages/Partners/Partners";
import Offers from "./pages/offers/Offers";
import OffersNew from "./pages/offers/OffersNew";
import OffersSupplierNew from "./pages/offers/OffersSupplierNew";
import Materials from "./pages/Material/Materials";
import MaterialNew from "./pages/Material/MaterialNew";
import ProductCategoryNew from "./pages/Material/ProductCategoryNew";
import Trades from "./pages/transactions/Trades";
import {TradeNew} from "./pages/transactions/TradeNew";
import TradeView from "./pages/transactions/TradeView";
import AssetOperations from "./pages/AssetOperations/AssetOperations";
import AssetOperationsNew from "./pages/AssetOperations/AssetOperationsNew";
import GraphPage from "./pages/Graph/GraphPage";
import Login from "./pages/Login/Login";
import ICPLogin from "./pages/Login/ICPLogin";

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'


// 1. Get projectId
const projectId = 'e55dee800a9c2117a91613b30aa697ee'

// 2. Set chains
const chain = {
    chainId: 11155111,
    name: 'Sepolia Infura',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: "https://sepolia.infura.io/v3/14bc392775034b3d80988f5211a95985",
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
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
            <Routes>
                <Route element={<MenuLayout />}>
                    <Route element={<PrivateRoutes />}>
                        <Route index element={<Home />} />
                        <Route path={paths.PROFILE} element={<Profile />} />
                        <Route path={paths.PARTNERS} element={<Partners />}/>
                        <Route path={paths.OFFERS} element={<Offers />}/>
                        <Route path={paths.OFFERS_NEW} element={<OffersNew />}/>
                        <Route path={paths.OFFERS_SUPPLIER_NEW} element={<OffersSupplierNew />}/>
                        <Route path={paths.MATERIALS} element={<Materials />}/>
                        <Route path={paths.MATERIAL_NEW} element={<MaterialNew />}/>
                        <Route path={paths.PRODUCT_CATEGORY_NEW} element={<ProductCategoryNew />}/>
                        <Route path={paths.TRADES} element={<Trades />}/>
                        <Route path={paths.TRADE_NEW} element={<TradeNew />}/>
                        <Route path={paths.TRADE_VIEW} element={<TradeView />}/>
                        <Route path={paths.ASSET_OPERATIONS} element={<AssetOperations />}/>
                        <Route path={paths.ASSET_OPERATIONS_NEW} element={<AssetOperationsNew />} />
                        <Route path={paths.GRAPH} element={<GraphPage />}/>
                    </Route>
                    <Route path={paths.LOGIN} element={<Login />}/>
                    <Route path={paths.ICP_LOGIN} element={<ICPLogin />}/>
                    <Route path="*" element={<Navigate to={paths.LOGIN}/>}/>
                </Route>
            </Routes>
        </Worker>
    );
};

export default App;
