export class OfferPresentable {
    private _id: number;
    private _owner: string;
    private _productCategory: string;

    constructor(id?: number, owner?: string, productCategory?: string);
    constructor(id: number, owner: string, productCategory: string) {
        this._id = id;
        this._owner = owner;
        this._productCategory = productCategory;
    }


    get id(): number {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setOwner(value: string): this {
        this._owner = value;
        return this;
    }

    setProductCategory(value: string): this {
        this._productCategory = value;
        return this;
    }
}
