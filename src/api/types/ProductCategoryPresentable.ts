export class ProductCategoryPresentable {
    private _id: number;
    private _name: string
    private _quality: number;

    constructor(id?: number, name?: string, quality?: number);
    constructor(id: number, name: string, quality: number) {
        this._id = id;
        this._name = name;
        this._quality = quality;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get quality(): number {
        return this._quality;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setName(value: string): this {
        this._name = value;
        return this;
    }

    setQuality(value: number): this {
        this._quality = value;
        return this;
    }
}
