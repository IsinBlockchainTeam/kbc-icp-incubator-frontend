import {OfferPresentable} from "../OfferPresentable";

describe('OfferPresentable', () => {
    const offerPresentable = new OfferPresentable();

    it('should be empty', () => {
        expect(offerPresentable.id).toBeUndefined();
        expect(offerPresentable.owner).toBeUndefined();
        expect(offerPresentable.productCategory).toBeUndefined();
    });

    it('should set id', () => {
        expect(offerPresentable.setId(1).id).toBe(1);
    });

    it('should set owner', () => {
        expect(offerPresentable.setOwner('owner').owner).toBe('owner');
    });

    it('should set product category', () => {
        expect(offerPresentable.setProductCategory('category').productCategory).toBe('category');
    });
});