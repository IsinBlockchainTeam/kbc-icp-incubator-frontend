import React from "react";
import TradeFormView from "../../../../../components/form/TradeFormView";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";

export const LegacyOrderView = () => {
    return (
        <CardPage title="Order">
            <TradeFormView
                tradeType={'order'}
                documentTypeTitle={'DocumentPresentable Type'}
                validFromTitle={'Valid From'}
                validUntilTitle={'Valid Until'}
            />
        </CardPage>
    )
}

export default LegacyOrderView;
