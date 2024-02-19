export interface OfferStrategy<T> {
    saveSupplier(supplier: string, name: string): Promise<void>;

    saveOffer(offer: string, productCategoryId: number): Promise<void>;

    getAllOffers(): Promise<T[]>;
}
