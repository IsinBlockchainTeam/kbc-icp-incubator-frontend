import { MaterialPresentable } from "./MaterialPresentable";

export class TransformationPresentable {
    private _id: number;
    private _name: string;
    private _inputMaterials: MaterialPresentable[];
    private _outputMaterial: MaterialPresentable;

    constructor(id?: number, name?: string, inputMaterials?: MaterialPresentable[], outputMaterial?: MaterialPresentable);
    constructor(id: number, name: string, inputMaterials: MaterialPresentable[], outputMaterial: MaterialPresentable) {
        this._id = id;
        this._name = name;
        this._inputMaterials = inputMaterials;
        this._outputMaterial = outputMaterial;
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
}
