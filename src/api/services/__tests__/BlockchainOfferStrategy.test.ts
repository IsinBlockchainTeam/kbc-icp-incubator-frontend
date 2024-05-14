import {UseBlockchainLibraryUtils} from "../../../hooks/useBlockchainLibraryUtils";
import {getWalletAddress} from "../../../../utils/storage";
import {BlockchainOfferStrategy} from "../../strategies/offer/BlockchainOfferStrategy";
import {OfferPresentable} from "../../types/OfferPresentable";
import {Offer, ProductCategory} from "../coffee-trading-management-lib/src/index";

jest.mock("../../../../utils/storage");
jest.mock("../../../BlockchainLibraryUtils");

describe('BlockchainOfferStrategy', () => {
    const mockedRegisterSupplier = jest.fn();
    const mockedRegisterOffer = jest.fn();
    const mockedGetAllOffers = jest.fn();

    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    let blockchainOfferStrategy: BlockchainOfferStrategy;

    beforeAll(() => {
        (getWalletAddress as jest.Mock).mockReturnValue(walletAddress);
        UseBlockchainLibraryUtils.getOfferService = jest.fn().mockReturnValue({
            registerSupplier: mockedRegisterSupplier,
            registerOffer: mockedRegisterOffer,
            getAllOffers: mockedGetAllOffers,
        });
        blockchainOfferStrategy = new BlockchainOfferStrategy();
    });

    afterEach(() => jest.clearAllMocks());

    it('should save a supplier', async () => {
        await blockchainOfferStrategy.saveSupplier('supplier', 'name');

        expect(mockedRegisterSupplier).toHaveBeenCalledTimes(1);
        expect(mockedRegisterSupplier).toHaveBeenNthCalledWith(1, 'supplier', 'name');
    });

    it('should save an offer', async () => {
        await blockchainOfferStrategy.saveOffer('offerorAddress', 1);

        expect(mockedRegisterOffer).toHaveBeenCalledTimes(1);
        expect(mockedRegisterOffer).toHaveBeenNthCalledWith(1, 'offerorAddress', 1);
    });

    it('should get all offers', async () => {
        mockedGetAllOffers.mockReturnValueOnce([
            new Offer(1, 'owner', new ProductCategory(1, 'name', 1, 'description')),
            new Offer(2, 'owner2', new ProductCategory(2, 'name2', 2, 'description2')),
        ]);
        const result = await blockchainOfferStrategy.getAllOffers();

        expect(result).toEqual([
            new OfferPresentable(1, 'owner', 'name'),
            new OfferPresentable(2, 'owner2', 'name2'),
        ]);
        expect(mockedGetAllOffers).toHaveBeenCalledTimes(1);
        expect(mockedGetAllOffers).toHaveBeenNthCalledWith(1);
    });
});
