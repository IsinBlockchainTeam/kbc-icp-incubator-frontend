import React from 'react'

import {HashRouter, Navigate, Route, Routes} from 'react-router-dom'
import Login from "../pages/Login/Login";
import {paths} from "../constants";
import Home from "../pages/Home/Home";
import {MenuLayout} from "../components/structure/MenuLayout/MenuLayout";
import Signup from "../pages/Signup/Signup";
import LegacyShipments from "../pages/transactions/legacy/trades/Shipment/LegacyShipments";
import LegacyShipmentCreate from "../pages/transactions/legacy/trades/Shipment/LegacyShipmentCreate";
import LegacyContracts from "../pages/transactions/legacy/trades/Contract/LegacyContracts";
import LegacyOrders from "../pages/transactions/legacy/trades/Order/LegacyOrders";
import LegacyShipmentView from "../pages/transactions/legacy/trades/Shipment/LegacyShipmentView";
import LegacyOrderView from "../pages/transactions/legacy/trades/Order/LegacyOrderView";
import LegacyContractView from "../pages/transactions/legacy/trades/Contract/LegacyContractView";
import Partners from "../pages/Partners/Partners";
import GraphPage from "../pages/Graph/blockchain/GraphPage";
import Auth0Login from "../pages/Login/Auth0Login";
import RouteViewMode from "./RouteViewMode";
import LegacyPartners from "../pages/Partners/LegacyPartners";
import Materials from "../pages/Material/Materials";
import LegacyTransformations from "../pages/Transformation/legacy/LegacyTransformations";
import Transformations from "../pages/Transformation/blockchain/Transformations";
import Trades from "../pages/transactions/blockchain/Trades";
import LegacyTransformationView from "../pages/Transformation/legacy/LegacyTransformationView";
import LegacyGraphPage from "../pages/Graph/legacy/LegacyGraphPage";
import LegacyCertifications from "../pages/transactions/legacy/certifications/LegacyCertifications";
import LegacyCertificationView from "../pages/transactions/legacy/certifications/LegacyCertificationView";
import TradeView from "../pages/transactions/blockchain/TradeView";
import Offers from "../pages/offers/Offers";

export default () => {

    return (
        <HashRouter>
            <Routes>
                <Route path={paths.HOME} element={<MenuLayout />}>
                    <Route index element={<Home />} />
                    <Route path={paths.LOGIN} element={<RouteViewMode component={Auth0Login} blockchainComponent={Login} />}/>
                    <Route path={paths.SIGNUP} element={<Signup />}/>
                    <Route path={paths.CONTRACTS} element={<LegacyContracts />}/>
                    <Route path={paths.CONTRACT_VIEW} element={<LegacyContractView />}/>
                    <Route path={paths.ORDERS} element={<LegacyOrders />}/>
                    <Route path={paths.ORDER_VIEW} element={<LegacyOrderView />}/>
                    <Route path={paths.SHIPMENTS} element={<LegacyShipments />}/>
                    <Route path={paths.SHIPMENT_CREATE} element={<LegacyShipmentCreate />}/>
                    <Route path={paths.SHIPMENT_VIEW} element={<LegacyShipmentView />}/>
                    <Route path={paths.PARTNERS} element={<RouteViewMode component={LegacyPartners} blockchainComponent={Partners} />}/>
                    <Route path={paths.OFFERS} element={<Offers />}/>
                    <Route path={paths.MATERIALS} element={<Materials />}/>
                    <Route path={paths.TRADES} element={<Trades />}/>
                    <Route path={paths.TRADE_VIEW} element={<TradeView />}/>
                    <Route path={paths.CERTIFICATIONS} element={<LegacyCertifications />}/>
                    <Route path={paths.CERTIFICATION_VIEW} element={<LegacyCertificationView />}/>
                    <Route path={paths.TRANSFORMATIONS} element={<RouteViewMode component={LegacyTransformations} blockchainComponent={Transformations} />}/>
                    <Route path={paths.TRANSFORMATION_VIEW} element={<RouteViewMode component={LegacyTransformationView} blockchainComponent={LegacyTransformationView} />}/>
                    <Route path={paths.GRAPH} element={<RouteViewMode component={LegacyGraphPage} blockchainComponent={GraphPage} />}/>
                </Route>
                <Route path="*" element={<Navigate to={paths.HOME}/>}/>
            </Routes>
        </HashRouter>
    )
}
