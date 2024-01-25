import {TradeFormInsert} from "../../../../../components/form/TradeFormInsert";
import React from "react";
import {CardPage} from "../../../../../components/structure/CardPage/CardPage";

export const LegacyShipmentCreate = () => {
    return (
        <CardPage title="Shipment create">
            <TradeFormInsert
                transactionType={'shipping'}
                documentTypeTitle={'Shipment Type'}
                validFromTitle={'Shipment Date'}
                referenceIdTitle={'Shipment Reference ID'}
                parentReferenceIdTitle={'Contract/Order Reference ID'}
            />
        </CardPage>
    )
}

export default LegacyShipmentCreate;
