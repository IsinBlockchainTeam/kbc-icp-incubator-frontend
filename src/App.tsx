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
import GraphPage from '@/pages/Graph/GraphPage';
import Login from '@/pages/Login/Login';
import { Provider as ReduxProvider } from 'react-redux/es/exports';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { MenuLayout } from '@/components/structure/MenuLayout/MenuLayout';
import { paths } from '@/constants/paths';
import AsyncDataLoader from './dataLoaders/AsyncDataLoader';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import Documents from '@/pages/Documents/Shipment/ShipmentDocuments';
import { Certifications } from '@/pages/Certification/Certifications';
import { CertificateNew } from '@/pages/Certification/New/CertificateNew';
import { CertificateView } from '@/pages/Certification/View/CertificateView';
import { useOrder } from '@/providers/icp/OrderProvider';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/icp/MaterialProvider';
import { useShipment } from '@/providers/icp/ShipmentProvider';
import { useOffer } from '@/providers/icp/OfferProvider';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';
import { useCertification } from '@/providers/icp/CertificationProvider';

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
                                        <Route path={paths.PARTNERS} element={<Partners />} />
                                        <Route
                                            path={paths.OFFERS}
                                            element={
                                                <AsyncDataLoader customUseContext={useOffer}>
                                                    <Offers />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.OFFERS_NEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useProductCategory}>
                                                    <AsyncDataLoader customUseContext={useOffer}>
                                                        <OfferNew />
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.MATERIALS}
                                            element={
                                                <AsyncDataLoader customUseContext={useProductCategory}>
                                                    <AsyncDataLoader customUseContext={useMaterial}>
                                                        <Materials />
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.MATERIAL_NEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useMaterial}>
                                                    <MaterialNew />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.PRODUCT_CATEGORY_NEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useProductCategory}>
                                                    <ProductCategoryNew />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        // TODO: are the following two duplicates?
                                        <Route
                                            path={paths.DOCUMENTS}
                                            element={
                                                <AsyncDataLoader customUseContext={useOrder}>
                                                    <Documents />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.ORDER_DOCUMENTS}
                                            element={
                                                <AsyncDataLoader customUseContext={useOrder}>
                                                    <Documents />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADES}
                                            element={
                                                <AsyncDataLoader customUseContext={useOrder}>
                                                    <Trades />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADE_NEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useEnumeration}>
                                                    <AsyncDataLoader customUseContext={useProductCategory}>
                                                        <AsyncDataLoader customUseContext={useMaterial}>
                                                            <AsyncDataLoader customUseContext={useOrder}>
                                                                <TradeNew />
                                                            </AsyncDataLoader>
                                                        </AsyncDataLoader>
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.TRADE_VIEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useProductCategory}>
                                                    <AsyncDataLoader customUseContext={useMaterial}>
                                                        <AsyncDataLoader customUseContext={useOrder}>
                                                            <AsyncDataLoader customUseContext={useShipment}>
                                                                <TradeView />
                                                            </AsyncDataLoader>
                                                        </AsyncDataLoader>
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.CERTIFICATIONS}
                                            element={
                                                <AsyncDataLoader customUseContext={useCertification}>
                                                    <Certifications />
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.CERTIFICATION_NEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useEnumeration}>
                                                    <AsyncDataLoader customUseContext={useMaterial}>
                                                        <CertificateNew />
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route
                                            path={paths.CERTIFICATION_VIEW}
                                            element={
                                                <AsyncDataLoader customUseContext={useEnumeration}>
                                                    <AsyncDataLoader customUseContext={useMaterial}>
                                                        <AsyncDataLoader customUseContext={useCertification}>
                                                            <CertificateView />
                                                        </AsyncDataLoader>
                                                    </AsyncDataLoader>
                                                </AsyncDataLoader>
                                            }
                                        />
                                        <Route path={paths.GRAPH} element={<GraphPage />} />
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
