export interface OfferStrategy<T> {
    getAllOffers(): Promise<T[]>;
}
