import { NegotiationStatus, TradeType, TradeStatus } from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable} from "./TradeLinePresentable";
import {getEnumKeyByValue} from "../../utils/utils";
import {DocumentPresentable} from "./DocumentPresentable";

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
    private _agreedAmount?: number;
    private _tokenAddress?: string;
    private _escrow?: string;
    private _status?: string;
    private _negotiationStatus?: string;
    private _type: TradeType;
    // documents
    private _paymentInvoice?: DocumentPresentable;
    private _deliveryNote?: DocumentPresentable;
    private _billOfLading?: DocumentPresentable;
    private _swissDecode?: DocumentPresentable;
    private _weightCertificate?: DocumentPresentable;
    private _fumigationCertificate?: DocumentPresentable;
    private _preferentialEntryCertificate?: DocumentPresentable;
    private _phytosanitaryCertificate?: DocumentPresentable;
    private _insuranceCertificate?: DocumentPresentable;

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

    get agreedAmount(): number | undefined {
        return this._agreedAmount;
    }

    get tokenAddress(): string | undefined {
        return this._tokenAddress;
    }

    get escrow(): string | undefined {
        return this._escrow;
    }

    get status(): string | undefined {
        return this._status;
    }

    get negotiationStatus(): string | undefined {
        return this._negotiationStatus;
    }

    get paymentInvoice(): DocumentPresentable | undefined {
        return this._paymentInvoice;
    }

    get deliveryNote(): DocumentPresentable | undefined {
        return this._deliveryNote;
    }

    get billOfLading(): DocumentPresentable | undefined {
        return this._billOfLading;
    }

    get swissDecode(): DocumentPresentable | undefined {
        return this._swissDecode;
    }

    get weightCertificate(): DocumentPresentable | undefined {
        return this._weightCertificate;
    }

    get fumigationCertificate(): DocumentPresentable | undefined {
        return this._fumigationCertificate;
    }

    get preferentialEntryCertificate(): DocumentPresentable | undefined {
        return this._preferentialEntryCertificate;
    }

    get phytosanitaryCertificate(): DocumentPresentable | undefined {
        return this._phytosanitaryCertificate;
    }

    get insuranceCertificate(): DocumentPresentable | undefined {
        return this._insuranceCertificate;
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

    setDocumentDeliveryDeadline(value: Date | undefined): this {
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

    setAgreedAmount(value: number | undefined): this {
        this._agreedAmount = value;
        return this;
    }

    setTokenAddress(value: string | undefined): this {
        this._tokenAddress = value;
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

    setNegotiationStatus(value: NegotiationStatus | undefined): this {
        this._negotiationStatus = value != null ? getEnumKeyByValue(NegotiationStatus, value) : undefined;
        return this;
    }

    setType(value: TradeType): this {
        this._type = value;
        return this;
    }

    setPaymentInvoice(value: DocumentPresentable | undefined): this {
        this._paymentInvoice = value;
        return this;
    }

    setDeliveryNote(value: DocumentPresentable | undefined): this {
        this._deliveryNote = value;
        return this;
    }

    setBillOfLading(value: DocumentPresentable | undefined): this {
        this._billOfLading = value;
        return this;
    }

    setSwissDecode(value: DocumentPresentable | undefined): this {
        this._swissDecode = value;
        return this;
    }

    setWeightCertificate(value: DocumentPresentable | undefined): this {
        this._weightCertificate = value;
        return this;
    }

    setFumigationCertificate(value: DocumentPresentable | undefined): this {
        this._fumigationCertificate = value;
        return this;
    }

    setPreferentialEntryCertificate(value: DocumentPresentable | undefined): this {
        this._preferentialEntryCertificate = value;
        return this;
    }

    setPhytosanitaryCertificate(value: DocumentPresentable | undefined): this {
        this._phytosanitaryCertificate = value;
        return this;
    }

    setInsuranceCertificate(value: DocumentPresentable | undefined): this {
        this._insuranceCertificate = value;
        return this;
    }

}
