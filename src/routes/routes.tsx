import React from 'react'

import {HashRouter, Navigate, Route, Routes} from 'react-router-dom'
import Login from "../pages/Login/Login";
import {paths} from "../constants";
import Home from "../pages/Home/Home";
import {MenuLayout} from "../components/structure/MenuLayout/MenuLayout";
import Partners from "../pages/Partners/Partners";
import GraphPage from "../pages/Graph/GraphPage";
import Materials from "../pages/Material/Materials";
import AssetOperations from "../pages/AssetOperations/AssetOperations";
import Trades from "../pages/transactions/Trades";
import TradeView from "../pages/transactions/TradeView";
import Offers from "../pages/offers/Offers";
import {TradeNew} from "../pages/transactions/TradeNew";
import ProductCategoryNew from "../pages/Material/ProductCategoryNew";
import MaterialNew from "../pages/Material/MaterialNew";
import AssetOperationsNew from "../pages/AssetOperations/AssetOperationsNew";
import OffersNew from "../pages/offers/OffersNew";
import OffersSupplierNew from "../pages/offers/OffersSupplierNew";
import Profile from "../pages/Profile/Profile";
import PrivateRoutes from "./PrivateRoutes";

export default () => {

    return (
        <HashRouter>
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
                    <Route path="*" element={<Navigate to={paths.LOGIN}/>}/>
                </Route>
            </Routes>
        </HashRouter>
    )
}
