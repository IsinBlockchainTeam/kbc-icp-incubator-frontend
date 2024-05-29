export type AssetOperationRequest = {
    name: string;
    inputMaterialIds: number[];
    outputMaterialId: number;
    latitude: string;
    longitude: string;
    processTypes: string[];
};
