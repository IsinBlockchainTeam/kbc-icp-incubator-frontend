import React from 'react';
import { Route } from 'react-router-dom';
import { paths } from '@/constants/paths';
import Profile from '@/pages/Profile/Profile';
import Partners from '@/pages/Partner/Partners';
import AsyncDataLoader from '../../dataLoaders/AsyncDataLoader';
import { useOffer } from '@/providers/icp/OfferProvider';
import Offers from '@/pages/Offer/Offers';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';
import OfferNew from '@/pages/Offer/OfferNew';
import { useMaterial } from '@/providers/icp/MaterialProvider';
import Materials from '@/pages/Material/Materials';
import MaterialNew from '@/pages/Material/MaterialNew';
import ProductCategoryNew from '@/pages/Material/ProductCategoryNew';
import { useOrder } from '@/providers/icp/OrderProvider';
import Documents from '@/pages/Documents/Shipment/ShipmentDocuments';
import Trades from '@/pages/Trade/Trades';
import { useEnumeration } from '@/providers/icp/EnumerationProvider';
import { TradeNew } from '@/pages/Trade/New/TradeNew';
import { useShipment } from '@/providers/icp/ShipmentProvider';
import TradeView from '@/pages/Trade/View/TradeView';
import { Certifications } from '@/pages/Certification/Certifications';
import { CertificateNew } from '@/pages/Certification/New/CertificateNew';
import { CertificateView } from '@/pages/Certification/View/CertificateView';
import GraphPage from '@/pages/Graph/GraphPage';

const privateRoutes = (
    <>
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
        <Route path={paths.CERTIFICATIONS} element={<Certifications />} />
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
                        <CertificateView />
                    </AsyncDataLoader>
                </AsyncDataLoader>
            }
        />
        <Route path={paths.GRAPH} element={<GraphPage />} />
    </>
);

export default privateRoutes;
