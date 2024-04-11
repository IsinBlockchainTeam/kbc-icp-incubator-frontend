import {Service} from "./Service";
import {OfferStrategy} from "../strategies/offer/OfferStrategy";

export class OfferService<T> extends Service {
    private readonly _strategy: OfferStrategy<T>;

    constructor(offerStrategy: OfferStrategy<T>) {
        super();
        this._strategy = offerStrategy;
    }

    async saveSupplier(supplier: string, name: string): Promise<void> {
        return this._strategy.saveSupplier(supplier, name);
    }

    async saveOffer(offerorAddress: string, productCategoryId: number): Promise<void> {
        return this._strategy.saveOffer(offerorAddress, productCategoryId);
    }

    async getAllOffers(): Promise<T[]> {
        return this._strategy.getAllOffers();
    }
}
