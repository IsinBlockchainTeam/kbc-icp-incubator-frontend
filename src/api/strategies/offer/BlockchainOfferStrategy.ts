import {Strategy} from "../Strategy";
import {OfferStrategy} from "./OfferStrategy";
import {OfferPresentable} from "../../types/OfferPresentable";
import {Offer, OfferService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainOfferStrategy extends Strategy implements OfferStrategy<OfferPresentable> {
    private readonly _offerService: OfferService;

    constructor() {
        super(true);
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
            .setProductCategory(o.productCategory.name));
    }
}
