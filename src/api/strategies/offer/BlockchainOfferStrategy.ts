import {Strategy} from "../Strategy";
import {OfferStrategy} from "./OfferStrategy";
import {OfferPresentable} from "../../types/OfferPresentable";
import {OfferService} from "@kbc-lib/coffee-trading-management-lib";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainOfferStrategy extends Strategy implements OfferStrategy<OfferPresentable> {
    private readonly _offerService: OfferService;

    constructor() {
        super(true);
        this._offerService = BlockchainLibraryUtils.getOfferService();
    }

    async getAllOffers(): Promise<OfferPresentable[]> {
        const offers = await this._offerService.getAllOffers();
        return offers.map(o => new OfferPresentable()
            .setId(o.id)
            .setOwner(o.owner)
            .setProductCategory(o.productCategory));
    }
}
