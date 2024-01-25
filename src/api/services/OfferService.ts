import {Service} from "./Service";
import {OfferStrategy} from "../strategies/offer/OfferStrategy";

export class OfferService<T> extends Service {
    private readonly _strategy: OfferStrategy<T>;

    constructor(offerStrategy: OfferStrategy<T>) {
        super();
        this._strategy = offerStrategy;
    }

    async getAllOffers(): Promise<T[]> {
        return this._strategy.getAllOffers();
    }
}
