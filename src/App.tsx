import React from 'react';
import { Worker } from '@react-pdf-viewer/core';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import Profile from '@/pages/Profile/Profile';
import Partners from '@/pages/Partner/Partners';
import Offers from '@/pages/Offer/Offers';
import OfferNew from '@/pages/Offer/OfferNew';
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
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';
import { useEthRelationship } from '@/providers/entities/EthRelationshipProvider';
import { useEthGraph } from '@/providers/entities/EthGraphProvider';
import { AssetOperationView } from '@/pages/AssetOperation/AssetOperationView';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import Documents from '@/pages/Documents/Shipment/ShipmentDocuments';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/icp/MaterialProvider';
import { useShipment } from '@/providers/icp/ShipmentProvider';
import { useOffer } from '@/providers/icp/OfferProvider';

export const App = () => {
    return (
        <HashRouter>
            <ReduxProvider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.js">
                        <WalletConnectProvider>
                            <Routes>
                                <Route element={<MenuLayout />}>
                                    <Route element={<PrivateRoutes />}>
                                        <Route index path={paths.PROFILE} element={<Profile />} />
                                        <Route
                                            path={paths.PARTNERS}
                                            element={
                                                <DataLoader customUseContext={useEthRelationship}>
                                                    <Partners />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.OFFERS}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useOffer}>
                                                        <Offers />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.OFFERS_NEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader
                                                        customUseContext={useProductCategory}>
                                                        <DataLoader customUseContext={useOffer}>
                                                            <OfferNew />
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.MATERIALS}
                                            element={
                                                <DataLoader customUseContext={useProductCategory}>
                                                    <DataLoader customUseContext={useMaterial}>
                                                        <Materials />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.MATERIAL_NEW}
                                            element={
                                                <DataLoader customUseContext={useMaterial}>
                                                    <MaterialNew />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.PRODUCT_CATEGORY_NEW}
                                            element={
                                                <DataLoader customUseContext={useProductCategory}>
                                                    <ProductCategoryNew />
                                                </DataLoader>
                                            }
                                        />
                                        // TODO: are the following two duplicates?
                                        <Route
                                            path={paths.DOCUMENTS}
                                            element={
                                                <DataLoader customUseContext={useOrder}>
                                                    <Documents />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ORDER_DOCUMENTS}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useOrder}>
                                                        <Documents />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADES}
                                            element={
                                                <DataLoader customUseContext={useOrder}>
                                                    <Trades />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADE_NEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <DataLoader
                                                            customUseContext={useProductCategory}>
                                                            <DataLoader
                                                                customUseContext={useMaterial}>
                                                                <DataLoader
                                                                    customUseContext={
                                                                        useEthRawTrade
                                                                    }>
                                                                    <TradeNew />
                                                                </DataLoader>
                                                            </DataLoader>
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADE_VIEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <DataLoader
                                                            customUseContext={useProductCategory}>
                                                            <DataLoader
                                                                customUseContext={useMaterial}>
                                                                <DataLoader
                                                                    customUseContext={useOrder}>
                                                                    <DataLoader
                                                                        customUseContext={
                                                                            useShipment
                                                                        }>
                                                                        <TradeView />
                                                                    </DataLoader>
                                                                </DataLoader>
                                                            </DataLoader>
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ASSET_OPERATIONS}
                                            element={
                                                <DataLoader customUseContext={useEthAssetOperation}>
                                                    <AssetOperations />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ASSET_OPERATIONS_NEW}
                                            element={
                                                <DataLoader customUseContext={useEthMaterial}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <DataLoader
                                                            customUseContext={useEthAssetOperation}>
                                                            <AssetOperationNew />
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ASSET_OPERATIONS_VIEW}
                                            element={
                                                <DataLoader customUseContext={useEthMaterial}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <DataLoader
                                                            customUseContext={useEthAssetOperation}>
                                                            <AssetOperationView />
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.GRAPH}
                                            element={
                                                <DataLoader customUseContext={useEthGraph}>
                                                    <GraphPage />
                                                </DataLoader>
                                            }
                                        />
                                    </Route>
                                    <Route path={paths.LOGIN} element={<Login />} />
                                    <Route path="*" element={<Navigate to={paths.LOGIN} />} />
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
