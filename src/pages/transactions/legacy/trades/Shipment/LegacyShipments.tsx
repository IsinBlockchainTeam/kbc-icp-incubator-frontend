import React from "react";
import {paths} from "../../../../../constants";
import {TradeTable} from "../../../../../components/table/TradeTable";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";
import {TradeService} from "../../../../../api/services/TradeService";
import {LegacyTradeStrategy} from "../../../../../api/strategies/trade/LegacyTradeStrategy";

export const LegacyShipments = () => {
    const loadData = async () => {
        const tradeService = new TradeService(new LegacyTradeStrategy());
        return await tradeService.getShipments();
    }

    return (
        <CardPage title="Shipments">
            <TradeTable path={paths.SHIPMENT_VIEW} getData={() => loadData()} />
        </CardPage>
    );
}

export default LegacyShipments;
