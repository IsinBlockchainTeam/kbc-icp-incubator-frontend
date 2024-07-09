import { RelationshipService } from '@kbc-lib/coffee-trading-management-lib';
import { PartnershipPresentable } from '@/api/types/PartnershipPresentable';

export class EthPartnerService {
    private readonly _walletAddress: string;
    private _relationshipService: RelationshipService;

    constructor(walletAddress: string, relationshipService: RelationshipService) {
        this._walletAddress = walletAddress;
        this._relationshipService = relationshipService;
    }

    async getPartners(): Promise<PartnershipPresentable[]> {
        const relationshipIds = await this._relationshipService.getRelationshipIdsByCompany(
            this._walletAddress
        );
        const relationships = await Promise.all(
            relationshipIds.map(
                async (id) => await this._relationshipService.getRelationshipInfo(id)
            )
        );

        return relationships
            .map((r) => {
                if (!r.companyA.localeCompare(this._walletAddress)) r.companyB = r.companyA;
                return r;
            })
            .map((r) =>
                new PartnershipPresentable()
                    .setId(r.id)
                    .setCompanyName(r.companyB)
                    .setValidFrom(r.validFrom)
                    .setValidUntil(r.validUntil)
            );
    }
}
