import {AssetOperationPresentable} from "../AssetOperationPresentable";
import {MaterialPresentable} from "../MaterialPresentable";

describe('AssetOperationPresentable', () => {
    const assetOperationPresentable = new AssetOperationPresentable();

    it('should be empty', () => {
        expect(assetOperationPresentable.id).toBeUndefined();
        expect(assetOperationPresentable.name).toBeUndefined();
        expect(assetOperationPresentable.inputMaterials).toBeUndefined();
        expect(assetOperationPresentable.outputMaterial).toBeUndefined();
        expect(assetOperationPresentable.latitude).toBeUndefined();
        expect(assetOperationPresentable.longitude).toBeUndefined();
    });

    it('should set id', () => {
        assetOperationPresentable.setId(1);
        expect(assetOperationPresentable.id).toBe(1);
    });

    it('should set name', () => {
        assetOperationPresentable.setName('name');
        expect(assetOperationPresentable.name).toBe('name');
    });

    it('should set inputMaterials', () => {
        const inputMaterials: MaterialPresentable[] = [new MaterialPresentable(1, 'name')];
        assetOperationPresentable.setInputMaterials(inputMaterials);
        expect(assetOperationPresentable.inputMaterials).toEqual(inputMaterials);
    });

    it('should set outputMaterial', () => {
        const outputMaterial = new MaterialPresentable(1, 'name');
        assetOperationPresentable.setOutputMaterial(outputMaterial);
        expect(assetOperationPresentable.outputMaterial).toEqual(outputMaterial);
    });

    it('should set latitude', () => {
        assetOperationPresentable.setLatitude('latitude');
        expect(assetOperationPresentable.latitude).toBe('latitude');
    });

    it('should set longitude', () => {
        assetOperationPresentable.setLongitude('longitude');
        expect(assetOperationPresentable.longitude).toBe('longitude');
    });
});