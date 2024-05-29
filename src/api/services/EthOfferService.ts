import {Offer, OfferService} from "@kbc-lib/coffee-trading-management-lib";

export class EthOfferService {
    private readonly _offerService: OfferService;

    constructor(offerService: OfferService) {
        this._offerService = offerService;
    }

    async saveSupplier(supplier: string, name: string): Promise<void> {
        return this._offerService.registerSupplier(supplier, name);
    }

    async saveOffer(offerorAddress: string, productCategoryId: number): Promise<void> {
        return this._offerService.registerOffer(offerorAddress, productCategoryId);
    }

    async getAllOffers(): Promise<Offer[]> {
        return this._offerService.getAllOffers();
    }
}
