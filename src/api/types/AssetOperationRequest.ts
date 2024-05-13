import { AssetOperation } from "@kbc-lib/coffee-trading-management-lib";

// export type Prova = Omit<typeof Document, "id"> & {
//     id: number;
// }

// export type AssetOperationRequestPresentable = Omit<typeof AssetOperation, "id" | "inputMaterials" | "outputMaterials"> & {
//     id: number;
//     inputMaterials: number[];
//     outputMaterial: number;
// }

export class AssetOperationRequest {
    private _name: string;

    private _inputMaterialIds: number[];

    private _outputMaterialId: number;

    private _latitude: string;

    private _longitude: string;

    private _processTypes: string[];

    constructor(name: string, inputMaterialIds: number[], outputMaterialId: number, latitude: string, longitude: string, processTypes: string[]) {
        this._name = name;
        this._inputMaterialIds = inputMaterialIds;
        this._outputMaterialId = outputMaterialId;
        this._latitude = latitude;
        this._longitude = longitude;
        this._processTypes = processTypes;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get inputMaterialIds(): number[] {
        return this._inputMaterialIds;
    }

    set inputMaterialIds(value: number[]) {
        this._inputMaterialIds = value;
    }

    get outputMaterialId(): number {
        return this._outputMaterialId;
    }

    set outputMaterialId(value: number) {
        this._outputMaterialId = value;
    }

    get latitude(): string {
        return this._latitude;
    }

    set latitude(value: string) {
        this._latitude = value;
    }

    get longitude(): string {
        return this._longitude;
    }

    set longitude(value: string) {
        this._longitude = value;
    }

    get processTypes(): string[] {
        return this._processTypes;
    }

    set processTypes(value: string[]) {
        this._processTypes = value;
    }
}
