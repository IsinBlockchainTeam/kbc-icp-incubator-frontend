import {
    NegotiationStatus,
    TradeType,
    TradeStatus,
    DocumentType,
    BasicTrade, OrderTrade, Trade
} from "@kbc-lib/coffee-trading-management-lib";
import {DocumentPresentable} from "./DocumentPresentable";

export type TradePreviewPresentable = {
    id: number;
    supplier: string;
    commissioner: string;
    type: TradeType;
    negotiationStatus?: NegotiationStatus;
}

export abstract class DetailedTradePresentable {
    private _documents: Map<DocumentType, DocumentPresentable>;

    protected constructor(documents?: Map<DocumentType, DocumentPresentable>) {
        this._documents = documents ?? new Map<DocumentType, DocumentPresentable>();
    }

    get documents(): Map<DocumentType, DocumentPresentable> {
        return this._documents;
    }

    set document(value: Map<DocumentType, DocumentPresentable>) {
        this._documents = value;
    }

    abstract get trade(): Trade;

    abstract set trade(value: Trade);
}

export class BasicTradePresentable extends DetailedTradePresentable {
    private _basicTrade: BasicTrade;

    constructor(basicTrade: BasicTrade, documents?: Map<DocumentType, DocumentPresentable>) {
        super(documents);
        this._basicTrade = basicTrade;
    }

    get trade(): Trade {
        return this._basicTrade;
    }

    set trade(value: Trade) {
        this._basicTrade = value as BasicTrade;
    }
}

export class OrderTradePresentable extends DetailedTradePresentable {
    private _orderTrade: OrderTrade;

    private _status: TradeStatus;

    constructor(orderTrade: OrderTrade, status: TradeStatus, documents?: Map<DocumentType, DocumentPresentable>) {
        super(documents);
        this._orderTrade = orderTrade;
        this._status = status;
    }

    get status(): TradeStatus {
        return this._status;
    }

    set status(value: TradeStatus) {
        this._status = value;
    }

    get trade(): Trade {
        return this._orderTrade;
    }

    set trade(value: Trade) {
        this._orderTrade = value as OrderTrade;
    }
}
