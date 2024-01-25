import {PartnerStrategy} from "./PartnerStrategy";
import {PartnershipPresentable} from "../../types/PartnershipPresentable";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";
import {Strategy} from "../Strategy";
import {RelationshipService} from "@kbc-lib/coffee-trading-management-lib";

export class BlockchainPartnerStrategy extends Strategy implements PartnerStrategy<PartnershipPresentable> {
    private _relationshipService: RelationshipService;

    constructor() {
        super(true);
        this._relationshipService = BlockchainLibraryUtils.getRelationshipService();
    }

    async getPartners(): Promise<PartnershipPresentable[]> {
        const relationshipIds = await this._relationshipService.getRelationshipIdsByCompany(this._walletAddress);
        const relationships = await Promise.all(relationshipIds.map(async id => this._relationshipService.getRelationshipInfo(id)));

        return relationships.map(r => {
            if (!r.companyA.localeCompare(this._walletAddress)) r.companyB = r.companyA;
            return r;
        }).map(r =>
            new PartnershipPresentable()
                .setId(r.id)
                .setCompanyName(r.companyB)
                .setValidFrom(r.validFrom)
                .setValidUntil(r.validUntil)
        );
    }
}
