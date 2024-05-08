import {Service} from "./Service";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {Offer, OfferService} from "@kbc-lib/coffee-trading-management-lib";
import {OfferPresentable} from "../types/OfferPresentable";
import {ProductCategoryPresentable} from "../types/ProductCategoryPresentable";

export class EthOfferService extends Service {
    private readonly _offerService: OfferService;

    constructor() {
        super();
        this._offerService = BlockchainLibraryUtils.getOfferService();
    }

    async saveSupplier(supplier: string, name: string): Promise<void> {
        return this._offerService.registerSupplier(supplier, name);
    }

    async saveOffer(offerorAddress: string, productCategoryId: number): Promise<void> {
        return this._offerService.registerOffer(offerorAddress, productCategoryId);
    }

    async getAllOffers(): Promise<OfferPresentable[]> {
        const offers = await this._offerService.getAllOffers();
        return offers.map((o: Offer) => new OfferPresentable()
            .setId(o.id)
            .setOwner(o.owner)
            .setProductCategory(new ProductCategoryPresentable(o.productCategory.id, o.productCategory.name, o.productCategory.quality)));
    }
}
