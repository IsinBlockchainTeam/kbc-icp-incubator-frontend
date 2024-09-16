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
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthOffer } from '@/providers/entities/EthOfferProvider';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { useEthRawTrade } from '@/providers/entities/EthRawTradeProvider';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';
import { useEthRelationship } from '@/providers/entities/EthRelationshipProvider';
import { useEthGraph } from '@/providers/entities/EthGraphProvider';
import { AssetOperationView } from '@/pages/AssetOperation/AssetOperationView';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import Documents from '@/pages/Documents/Shipment/ShipmentDocuments';
import { Certifications } from '@/pages/Certification/Certifications';
import { useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import { CertificateNew } from '@/pages/Certification/New/CertificateNew';

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
                                                    <DataLoader customUseContext={useEthOffer}>
                                                        <Offers />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.OFFERS_NEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthMaterial}>
                                                        <DataLoader customUseContext={useEthOffer}>
                                                            <OfferNew />
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.OFFERS_SUPPLIER_NEW}
                                            element={
                                                <DataLoader customUseContext={useEthOffer}>
                                                    <OfferSupplierNew />
                                                </DataLoader>
                                            }
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
                                        <Route
                                            path={paths.DOCUMENTS}
                                            element={
                                                <DataLoader customUseContext={useEthRawTrade}>
                                                    <Documents />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ORDER_DOCUMENTS}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthRawTrade}>
                                                        <Documents />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADES}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthRawTrade}>
                                                        <Trades />
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADE_NEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <DataLoader
                                                            customUseContext={useEthMaterial}>
                                                            <DataLoader
                                                                customUseContext={useEthRawTrade}>
                                                                <TradeNew />
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
                                                            customUseContext={useEthMaterial}>
                                                            <DataLoader
                                                                customUseContext={useEthRawTrade}>
                                                                <TradeView />
                                                            </DataLoader>
                                                        </DataLoader>
                                                    </DataLoader>
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.CERTIFICATIONS}
                                            element={
                                                <DataLoader customUseContext={useEthRawCertificate}>
                                                    <Certifications />
                                                </DataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.CERTIFICATION_NEW}
                                            element={
                                                <DataLoader customUseContext={useICPOrganization}>
                                                    <DataLoader customUseContext={useEthEnumerable}>
                                                        <CertificateNew />
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
