import { EthPartnerService } from '@/api/services/EthPartnerService';
import {
    Relationship,
    RelationshipDriver,
    RelationshipService
} from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthPartnerService', () => {
    let ethPartnerService: EthPartnerService;
    let relationService: RelationshipService;

    beforeEach(() => {
        relationService = new RelationshipService({} as unknown as RelationshipDriver);
        ethPartnerService = new EthPartnerService('walletAddress', relationService);
    });

    it('should successfully fetch partners', async () => {
        const relationship = new Relationship(1, 'company1', 'company2', new Date(), new Date());
        relationService.getRelationshipIdsByCompany = jest.fn().mockResolvedValue([1]);
        relationService.getRelationshipInfo = jest.fn().mockResolvedValue(relationship);

        const partners = await ethPartnerService.getPartners();
        expect(partners).toBeDefined();
        expect(partners.length).toBe(1);
        expect(partners[0].id).toEqual(relationship.id);
        expect(partners[0].validFrom).toEqual(relationship.validFrom);
        expect(partners[0].validUntil).toEqual(relationship.validUntil);

        expect(relationService.getRelationshipIdsByCompany).toHaveBeenCalled();
        expect(relationService.getRelationshipInfo).toHaveBeenCalled();
    });
});
