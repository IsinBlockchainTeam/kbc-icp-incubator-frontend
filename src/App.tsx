import React from 'react';
import { Worker } from '@react-pdf-viewer/core';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import { paths } from '@/constants/index';
import Profile from '@/pages/Profile/Profile';
import Partners from '@/pages/Partners/Partners';
import Offers from '@/pages/offers/Offers';
import OffersNew from '@/pages/offers/OffersNew';
import OffersSupplierNew from '@/pages/offers/OffersSupplierNew';
import Materials from '@/pages/Material/Materials';
import MaterialNew from '@/pages/Material/MaterialNew';
import ProductCategoryNew from '@/pages/Material/ProductCategoryNew';
import Trades from '@/pages/transactions/Trades';
import { TradeNew } from '@/pages/transactions/TradeNew';
import TradeView from '@/pages/transactions/TradeView';
import AssetOperations from '@/pages/AssetOperations/AssetOperations';
import AssetOperationsNew from '@/pages/AssetOperations/AssetOperationsNew';
import GraphPage from '@/pages/Graph/GraphPage';
import Login from '@/pages/Login/Login';
import { Provider as ReduxProvider } from 'react-redux/es/exports';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { MenuLayout } from '@/components/structure/MenuLayout/MenuLayout';

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
                                    <Route path={paths.OFFERS_NEW} element={<OffersNew />} />
                                    <Route
                                        path={paths.OFFERS_SUPPLIER_NEW}
                                        element={<OffersSupplierNew />}
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
                                        element={<AssetOperationsNew />}
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
