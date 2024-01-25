import {TradeStrategy} from "./TradeStrategy";
import {ConfirmationTradePresentable, TableTradePresentable} from "@unece/cotton-fetch";
import TradeControllerApi from "../../controllers/unece/TradeControllerApi";
import {Strategy} from "../Strategy";

export class LegacyTradeStrategy extends Strategy implements TradeStrategy<TableTradePresentable, ConfirmationTradePresentable> {
    constructor() {
        super(false);
    }
    getOrders(): Promise<TableTradePresentable[]> {
        return TradeControllerApi.getOrders();
    }

    getContracts(): Promise<TableTradePresentable[]> {
        return TradeControllerApi.getContracts();
    }

    getShipments(): Promise<TableTradePresentable[]> {
        return TradeControllerApi.getShippings();
    }

    getContractById(id: number): Promise<ConfirmationTradePresentable> {
        return TradeControllerApi.getContractById({id});
    }

    getOrderById(id: number): Promise<ConfirmationTradePresentable> {
        return TradeControllerApi.getOrderById({id});
    }

    getShippingById(id: number): Promise<ConfirmationTradePresentable> {
        return TradeControllerApi.getShippingById({id});
    }

}
