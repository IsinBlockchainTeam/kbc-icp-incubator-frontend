import {OrderLineRequest} from "@kbc-lib/coffee-trading-management-lib";

export type OrderTradeRequest = {
    supplier: string;
    customer: string;
    commissioner: string;
    lines: OrderLineRequest[];
    paymentDeadline: number;
    documentDeliveryDeadline: number;
    arbiter: string;
    shippingDeadline: number;
    deliveryDeadline: number;
    agreedAmount: number;
    tokenAddress: string;
    incoterms: string;
    shipper: string;
    shippingPort: string;
    deliveryPort: string;
}
