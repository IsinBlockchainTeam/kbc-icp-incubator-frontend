import React from "react";
import TradeFormView from "../../../../../components/form/TradeFormView";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";

export const LegacyShipmentView = () => {
    return (
        <CardPage title="Shipment">
            <TradeFormView
                tradeType={'shipping'}
                documentTypeTitle={'Dispatch note'}
                validFromTitle={'Shipment Date'}
            />
        </CardPage>
    )
}

export default LegacyShipmentView;
