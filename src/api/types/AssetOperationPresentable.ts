import { MaterialPresentable } from "./MaterialPresentable";

export class AssetOperationPresentable {
    private _id: number;
    private _name: string;
    private _inputMaterials: MaterialPresentable[];
    private _outputMaterial: MaterialPresentable;
    private _latitude: string;
    private _longitude: string;
    private _processTypes: string[];

    constructor(id?: number, name?: string, inputMaterials?: MaterialPresentable[], outputMaterial?: MaterialPresentable, latitude?: string, longitude?: string, processTypes?: string[]);
    constructor(id: number, name: string, inputMaterials: MaterialPresentable[], outputMaterial: MaterialPresentable, latitude: string, longitude: string, processTypes: string[]) {
        this._id = id;
        this._name = name;
        this._inputMaterials = inputMaterials;
        this._outputMaterial = outputMaterial;
        this._latitude = latitude;
        this._longitude = longitude;
        this._processTypes = processTypes;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get inputMaterials(): MaterialPresentable[] {
        return this._inputMaterials;
    }

    get outputMaterial(): MaterialPresentable {
        return this._outputMaterial;
    }

    get latitude(): string {
        return this._latitude;
    }

    get longitude(): string {
        return this._longitude;
    }

    get processTypes(): string[] {
        return this._processTypes;
    }

    setId(value: number): this {
        this._id = value;
        return this;
    }

    setName(value: string): this {
        this._name = value;
        return this;
    }

    setInputMaterials(value: MaterialPresentable[]): this {
        this._inputMaterials = value;
        return this;
    }

    setOutputMaterial(value: MaterialPresentable): this {
        this._outputMaterial = value;
        return this;
    }

    setLatitude(value: string): this {
        this._latitude = value;
        return this;
    }

    setLongitude(value: string): this {
        this._longitude = value;
        return this;
    }

    setProcessTypes(value: string[]): this {
        this._processTypes = value;
        return this;
    }
}
