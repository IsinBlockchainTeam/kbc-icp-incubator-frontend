import React from "react";
import {paths} from "../../../../../constants";
import {TradeTable} from "../../../../../components/table/TradeTable";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";
import {TradeService} from "../../../../../api/services/TradeService";
import {LegacyTradeStrategy} from "../../../../../api/strategies/trade/LegacyTradeStrategy";

export const LegacyContracts = () => {
    const loadData = async () => {
        const tradeService = new TradeService(new LegacyTradeStrategy());
        return await tradeService.getContracts();
    }

    return (
        <CardPage title="Contracts">
            <TradeTable path={paths.CONTRACT_VIEW} getData={() => loadData()}/>
        </CardPage>
    );
}

export default LegacyContracts;
