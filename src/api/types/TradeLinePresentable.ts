import {MaterialPresentable} from "./MaterialPresentable";
import {ProductCategoryPresentable} from "./ProductCategoryPresentable";

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
    private _productCategory?: ProductCategoryPresentable;
    private _quantity?: number;
    private _unit?: string;
    private _price?: TradeLinePrice;

    constructor(id?: number, material?: MaterialPresentable, quantity?: number, unit?: string, price?: TradeLinePrice, productCategory?: ProductCategoryPresentable);
    constructor(id: number, material: MaterialPresentable, quantity: number, unit: string, price: TradeLinePrice, productCategory: ProductCategoryPresentable) {
        this._id = id;
        this._material = material;
        this._quantity = quantity;
        this._unit = unit;
        this._price = price;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    get material(): MaterialPresentable | undefined {
        return this._material;
    }

    get productCategory(): ProductCategoryPresentable | undefined {
        return this._productCategory;
    }

    get quantity(): number | undefined {
        return this._quantity;
    }

    get price(): TradeLinePrice | undefined {
        return this._price;
    }

    get unit(): string | undefined {
        return this._unit;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setMaterial(value?: MaterialPresentable): this {
        this._material = value;
        return this;
    }

    setProductCategory(value?: ProductCategoryPresentable): this {
        this._productCategory = value;
        return this;
    }

    setQuantity(value: number | undefined): this {
        this._quantity = value;
        return this;
    }

    setUnit(value: string | undefined): this {
        this._unit = value;
        return this;
    }

    setPrice(value: TradeLinePrice | undefined): this {
        this._price = value;
        return this;
    }

}
