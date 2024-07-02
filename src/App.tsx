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
import DataLoader from './DataLoader';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';

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
                                    <Route
                                        path={paths.OFFERS_NEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <OfferNew />
                                            </DataLoader>
                                        }
                                    />
                                    <Route
                                        path={paths.OFFERS_SUPPLIER_NEW}
                                        element={<OfferSupplierNew />}
                                    />
                                    <Route
                                        path={paths.MATERIALS}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <Materials />
                                            </DataLoader>
                                        }
                                    />
                                    <Route
                                        path={paths.MATERIAL_NEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <MaterialNew />
                                            </DataLoader>
                                        }
                                    />
                                    <Route
                                        path={paths.PRODUCT_CATEGORY_NEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <ProductCategoryNew />
                                            </DataLoader>
                                        }
                                    />
                                    <Route path={paths.TRADES} element={<Trades />} />
                                    <Route
                                        path={paths.TRADE_NEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <TradeNew />
                                            </DataLoader>
                                        }
                                    />
                                    <Route
                                        path={paths.TRADE_VIEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <TradeView />
                                            </DataLoader>
                                        }
                                    />
                                    <Route
                                        path={paths.ASSET_OPERATIONS}
                                        element={<AssetOperations />}
                                    />
                                    <Route
                                        path={paths.ASSET_OPERATIONS_NEW}
                                        element={
                                            <DataLoader customUseContext={useEthMaterial}>
                                                <AssetOperationNew />
                                            </DataLoader>
                                        }
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
