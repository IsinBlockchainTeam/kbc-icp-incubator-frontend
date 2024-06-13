import { EthPartnerService } from '@/api/services/EthPartnerService';
import { RelationshipDriver, RelationshipService } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthPartnerService', () => {
    let ethPartnerService: EthPartnerService;
    let relationService: RelationshipService;

    beforeEach(() => {
        relationService = new RelationshipService({} as unknown as RelationshipDriver);
        ethPartnerService = new EthPartnerService('walletAddress', relationService);
    });

    it('should successfully fetch partners - companyA', async () => {
        relationService.getRelationshipIdsByCompany = jest.fn().mockResolvedValue([1]);
        relationService.getRelationshipInfo = jest.fn().mockResolvedValue({
            id: 1,
            companyA: 'walletAddress',
            companyB: 'company2',
            validFrom: new Date(),
            validUntil: new Date()
        });

        const partners = await ethPartnerService.getPartners();
        expect(partners).toBeDefined();
        expect(partners.length).toBe(1);
        expect(partners[0].id).toEqual(1);

        expect(relationService.getRelationshipIdsByCompany).toHaveBeenCalled();
        expect(relationService.getRelationshipInfo).toHaveBeenCalled();
    });
    it('should successfully fetch partners - companyB', async () => {
        relationService.getRelationshipIdsByCompany = jest.fn().mockResolvedValue([1]);
        relationService.getRelationshipInfo = jest.fn().mockResolvedValue({
            id: 1,
            companyA: 'company1',
            companyB: 'walletAddress',
            validFrom: new Date(),
            validUntil: new Date()
        });

        const partners = await ethPartnerService.getPartners();
        expect(partners).toBeDefined();
        expect(partners.length).toBe(1);
        expect(partners[0].id).toEqual(1);

        expect(relationService.getRelationshipIdsByCompany).toHaveBeenCalled();
        expect(relationService.getRelationshipInfo).toHaveBeenCalled();
    });
});
