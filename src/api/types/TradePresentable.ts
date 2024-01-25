import { TradeType, TradeStatus } from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable} from "./TradeLinePresentable";
import {getEnumKeyByValue} from "../../utils/utils";

export class TradePresentable {
    private _id: number;
    private _name?: string;
    private _lines: TradeLinePresentable[];
    private _supplier: string;
    private _customer?: string;
    private _commissioner?: string;
    private _incoterms?: string;
    private _paymentDeadline?: Date;
    private _documentDeliveryDeadline?: Date;
    private _shipper?: string;
    private _arbiter?: string;
    private _shippingPort?: string;
    private _shippingDeadline?: Date;
    private _deliveryPort?: string;
    private _deliveryDeadline?: Date;
    private _escrow?: string;
    private _status?: string;
    private _type: TradeType;

    constructor(id?: number, lines?: TradeLinePresentable[], supplier?: string, type?: TradeType);
    constructor(id: number, lines: TradeLinePresentable[], supplier: string, type: TradeType) {
        this._id = id;
        this._lines = lines;
        this._supplier = supplier;
        this._type = type;
    }

    get id(): number {
        return this._id;
    }

    get name(): string | undefined {
        return this._name;
    }

    get lines(): TradeLinePresentable[] {
        return this._lines;
    }

    get supplier(): string {
        return this._supplier;
    }

    get customer(): string | undefined {
        return this._customer;
    }

    get commissioner(): string | undefined {
        return this._commissioner;
    }

    get incoterms(): string | undefined {
        return this._incoterms;
    }

    get paymentDeadline(): Date | undefined {
        return this._paymentDeadline;
    }

    get documentDeliveryDeadline(): Date | undefined {
        return this._documentDeliveryDeadline;
    }

    get shipper(): string | undefined {
        return this._shipper;
    }

    get arbiter(): string | undefined {
        return this._arbiter;
    }

    get shippingPort(): string | undefined {
        return this._shippingPort;
    }

    get shippingDeadline(): Date | undefined {
        return this._shippingDeadline;
    }

    get deliveryPort(): string | undefined {
        return this._deliveryPort;
    }

    get type(): TradeType {
        return this._type;
    }

    get deliveryDeadline(): Date | undefined {
        return this._deliveryDeadline;
    }

    get escrow(): string | undefined {
        return this._escrow;
    }

    get status(): string | undefined {
        return this._status;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setName(value: string | undefined): this {
        this._name = value;
        return this;
    }

    setLines(value: TradeLinePresentable[]): this {
        this._lines = value;
        return this;
    }

    setCustomer(value: string): this {
        this._customer = value;
        return this;
    }

    setSupplier(value: string): this {
        this._supplier = value;
        return this;
    }

    setCommissioner(value: string | undefined): this {
        this._commissioner = value;
        return this;
    }

    setIncoterms(value: string | undefined): this {
        this._incoterms = value;
        return this;
    }

    setPaymentDeadline(value: Date | undefined): this {
        this._paymentDeadline = value;
        return this;
    }

    setDocumentDeliveryPipeline(value: Date | undefined): this {
        this._documentDeliveryDeadline = value;
        return this;
    }

    setShipper(value: string | undefined): this {
        this._shipper = value;
        return this;
    }

    setArbiter(value: string | undefined): this {
        this._arbiter = value;
        return this;
    }

    setShippingPort(value: string | undefined): this {
        this._shippingPort = value;
        return this;
    }

    setShippingDeadline(value: Date | undefined): this {
        this._shippingDeadline = value;
        return this;
    }

    setDeliveryPort(value: string | undefined): this {
        this._deliveryPort = value;
        return this;
    }

    setDeliveryDeadline(value: Date | undefined): this {
        this._deliveryDeadline = value;
        return this;
    }

    setEscrow(value: string | undefined): this {
        this._escrow = value;
        return this;
    }

    setStatus(value: TradeStatus | undefined): this {
        this._status = value != null ? getEnumKeyByValue(TradeStatus, value) : undefined;
        return this;
    }

    setType(value: TradeType): this {
        this._type = value;
        return this;
    }

}
