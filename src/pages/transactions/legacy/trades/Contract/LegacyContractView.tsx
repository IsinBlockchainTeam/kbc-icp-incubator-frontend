import React from "react";
import TradeFormView from "../../../../../components/form/TradeFormView";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";

export const LegacyContractView = () => {
    return (
        <CardPage title="Contract">
            <TradeFormView
                tradeType={'contract'}
                documentTypeTitle={'Document Type'}
                validFromTitle={'Valid From'}
                validUntilTitle={'Valid Until'}
            />
        </CardPage>
    )
}

export default LegacyContractView;
