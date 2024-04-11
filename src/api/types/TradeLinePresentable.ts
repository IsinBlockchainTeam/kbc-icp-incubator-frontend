import {MaterialPresentable} from "./MaterialPresentable";

export class TradeLinePrice {
    private _amount: number;
    private _fiat: string;

    constructor(amount?: number, fiat?: string);
    constructor(amount: number, fiat: string) {
        this._amount = amount;
        this._fiat = fiat;
    }

    get amount(): number {
        return this._amount;
    }

    get fiat(): string {
        return this._fiat;
    }

    setAmount(value: number): this {
        this._amount = value;
        return this;
    }

    setFiat(value: string): this {
        this._fiat = value;
        return this;
    }
}

export class TradeLinePresentable {
    private _id: number;
    private _material?: MaterialPresentable;
    private _quantity?: number;
    private _price?: TradeLinePrice;

    constructor(id?: number, material?: MaterialPresentable, quantity?: number, price?: TradeLinePrice);
    constructor(id: number, material: MaterialPresentable, quantity: number, price: TradeLinePrice) {
        this._id = id;
        this._material = material;
        this._quantity = quantity;
        this._price = price;
    }

    get id(): number {
        return this._id;
    }

    get material(): MaterialPresentable | undefined {
        return this._material;
    }

    get quantity(): number | undefined {
        return this._quantity;
    }

    get price(): TradeLinePrice | undefined {
        return this._price;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setMaterial(value?: MaterialPresentable): this {
        this._material = value;
        return this;
    }

    setQuantity(value: number | undefined): this {
        this._quantity = value;
        return this;
    }

    setPrice(value: TradeLinePrice | undefined): this {
        this._price = value;
        return this;
    }

}
