import { EthOfferService } from '@/api/services/EthOfferService';
import { Offer, OfferDriver, OfferService } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('@kbc-lib/coffee-trading-management-lib');

describe('EthOfferService', () => {
    let ethOfferService: EthOfferService;
    let offerService: OfferService;

    beforeEach(() => {
        offerService = new OfferService({} as unknown as OfferDriver);
        ethOfferService = new EthOfferService(offerService);
    });

    it('should successfully save supplier', async () => {
        const supplier = 'supplier';
        const name = 'Test';

        await ethOfferService.saveSupplier(supplier, name);

        expect(offerService.registerSupplier).toHaveBeenCalledWith(supplier, name);
    });

    it('should successfully save offer', async () => {
        const offerorAddress = 'offerorAddress';
        const productCategoryId = 1;

        await ethOfferService.saveOffer(offerorAddress, productCategoryId);

        expect(offerService.registerOffer).toHaveBeenCalledWith(offerorAddress, productCategoryId);
    });

    it('should successfully fetch all offers', async () => {
        offerService.getAllOffers = jest.fn().mockResolvedValue([{} as Offer]);

        const offers = await ethOfferService.getAllOffers();
        expect(offerService.getAllOffers).toHaveBeenCalled();
        expect(offers).toBeDefined();
    });
});
