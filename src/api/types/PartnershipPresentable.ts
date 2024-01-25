export class PartnershipPresentable {
    private _id?: number;
    private _companyName: string;
    private _validFrom?: Date;
    private _validUntil?: Date;

    constructor(companyName?: string);
    constructor(companyName: string) {
        this._companyName = companyName;
    }

    get id(): number | undefined {
        return this._id;
    }

    get companyName(): string {
        return this._companyName;
    }

    get validFrom(): Date | undefined {
        return this._validFrom;
    }

    get validUntil(): Date | undefined {
        return this._validUntil;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }
    setCompanyName(value: string): this {
        this._companyName = value;
        return this;
    }

    setValidFrom(value: Date | undefined): this {
        this._validFrom = value;
        return this;
    }

    setValidUntil(value: Date | undefined): this {
        this._validUntil = value;
        return this;
    }
}
