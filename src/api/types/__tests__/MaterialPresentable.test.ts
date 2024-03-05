import {MaterialPresentable} from "../MaterialPresentable";

describe('MaterialPresentable', () => {
    const materialPresentable = new MaterialPresentable();

    it('should be empty', () => {
        expect(materialPresentable.id).toBeUndefined();
        expect(materialPresentable.name).toBeUndefined();
    });

    it('should set id', () => {
        expect(materialPresentable.setId(1).id).toBe(1);
    });

    it('should set name', () => {
        expect(materialPresentable.setName('name').name).toBe('name');
    });
});