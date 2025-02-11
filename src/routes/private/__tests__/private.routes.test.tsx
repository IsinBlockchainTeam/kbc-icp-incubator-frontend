import React, { ReactNode } from 'react';
import { act, render, RenderResult } from '@testing-library/react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { paths } from '@/constants/paths';
import privateRoutes from '../private.routes';

jest.mock('@/data-loaders/AsyncDataLoader', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));
jest.mock('@/data-loaders/SyncDataLoader', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

// mock pages
jest.mock('@/pages/Profile/Profile', () => ({
    __esModule: true,
    default: () => <div>Profile</div>
}));
jest.mock('@/pages/Partner/Partners', () => ({
    __esModule: true,
    default: () => <div>Partners</div>
}));
jest.mock('@/pages/Partner/PartnerInvite', () => ({
    __esModule: true,
    default: () => <div>PartnerInvite</div>
}));
jest.mock('@/pages/Offer/Offers', () => ({
    __esModule: true,
    default: () => <div>Offers</div>
}));
jest.mock('@/pages/Offer/OfferNew', () => ({
    __esModule: true,
    default: () => <div>OfferNew</div>
}));
jest.mock('@/pages/Material/Materials', () => ({
    __esModule: true,
    default: () => <div>Materials</div>
}));
jest.mock('@/pages/Material/MaterialNew', () => ({
    __esModule: true,
    default: () => <div>MaterialNew</div>
}));
jest.mock('@/pages/Documents/Shipment/ShipmentDocuments', () => ({
    __esModule: true,
    default: () => <div>Documents</div>
}));
jest.mock('@/pages/Trade/Trades', () => ({
    __esModule: true,
    default: () => <div>Trades</div>
}));
jest.mock('@/pages/Trade/New/TradeNew', () => ({
    TradeNew: () => <div>TradeNew</div>
}));
jest.mock('@/pages/Trade/View/TradeView', () => ({
    __esModule: true,
    default: () => <div>TradeView</div>
}));
jest.mock('@/pages/Certification/Certifications', () => ({
    Certifications: () => <div>Certifications</div>
}));
jest.mock('@/pages/Certification/New/CertificateNew', () => ({
    CertificateNew: () => <div>CertificateNew</div>
}));
jest.mock('@/pages/Certification/View/CertificateView', () => ({
    CertificateView: () => <div>CertificateView</div>
}));
jest.mock('@/pages/Graph/GraphPage', () => ({
    __esModule: true,
    default: () => <div>GraphPage</div>
}));
// mock hooks
jest.mock('@/providers/entities/icp/OfferProvider', () => ({ useOffer: jest.fn() }));
jest.mock('@/providers/entities/icp/ProductCategoryProvider', () => ({ useProductCategory: jest.fn() }));
jest.mock('@/providers/entities/icp/MaterialProvider', () => ({ useMaterial: jest.fn() }));
jest.mock('@/providers/entities/icp/OrderProvider', () => ({ useOrder: jest.fn() }));
jest.mock('@/providers/entities/icp/EnumerationProvider', () => ({ useEnumeration: jest.fn() }));
jest.mock('@/providers/entities/icp/ShipmentProvider', () => ({ useShipment: jest.fn() }));
jest.mock('@/providers/entities/icp/CertificationProvider', () => ({ useCertification: jest.fn() }));
jest.mock('@/providers/entities/icp/BusinessRelationProvider', () => ({ useBusinessRelation: jest.fn() }));

describe('Private Routes', () => {
    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    });
    const renderWithRouter = async (route: string) => {
        let tree: RenderResult = {} as RenderResult;
        await act(async () => {
            tree = render(
                <MemoryRouter initialEntries={[{ pathname: route }]}>
                    <Routes>{privateRoutes}</Routes>
                </MemoryRouter>
            );
        });
        return tree;
    };

    it('should render Profile page', async () => {
        const { getByText } = await renderWithRouter(paths.PROFILE);
        expect(getByText('Profile')).toBeInTheDocument();
    });

    it('should render Partners page', async () => {
        const { getByText } = await renderWithRouter(paths.PARTNERS);
        expect(getByText('Partners')).toBeInTheDocument();
    });

    it('should render Partner Invite page', async () => {
        const { getByText } = await renderWithRouter(paths.PARTNER_INVITE);
        expect(getByText('PartnerInvite')).toBeInTheDocument();
    });

    it('should render Offers page', async () => {
        const { getByText } = await renderWithRouter(paths.OFFERS);
        expect(getByText('Offers')).toBeInTheDocument();
    });

    it('should render OfferNew page', async () => {
        const { getByText } = await renderWithRouter(paths.OFFERS_NEW);
        expect(getByText('OfferNew')).toBeInTheDocument();
    });

    it('should render Materials page', async () => {
        const { getByText } = await renderWithRouter(paths.MATERIALS);
        expect(getByText('Materials')).toBeInTheDocument();
    });

    it('should render MaterialNew page', async () => {
        const { getByText } = await renderWithRouter(paths.MATERIAL_NEW);
        expect(getByText('MaterialNew')).toBeInTheDocument();
    });

    it('should render Documents page', async () => {
        const { getByText } = await renderWithRouter(paths.DOCUMENTS);
        expect(getByText('Documents')).toBeInTheDocument();
    });

    it('should render Trades page', async () => {
        const { getByText } = await renderWithRouter(paths.TRADES);
        expect(getByText('Trades')).toBeInTheDocument();
    });

    it('should render TradeNew page', async () => {
        const { getByText } = await renderWithRouter(paths.TRADE_NEW);
        expect(getByText('TradeNew')).toBeInTheDocument();
    });

    it('should render TradeView page', async () => {
        const { getByText } = await renderWithRouter(paths.TRADE_VIEW);
        expect(getByText('TradeView')).toBeInTheDocument();
    });

    it('should render Certifications page', async () => {
        const { getByText } = await renderWithRouter(paths.CERTIFICATIONS);
        expect(getByText('Certifications')).toBeInTheDocument();
    });

    it('should render CertificateNew page', async () => {
        const { getByText } = await renderWithRouter(paths.CERTIFICATION_NEW);
        expect(getByText('CertificateNew')).toBeInTheDocument();
    });

    it('should render CertificateView page', async () => {
        const { getByText } = await renderWithRouter(paths.CERTIFICATION_VIEW);
        expect(getByText('CertificateView')).toBeInTheDocument();
    });

    it('should render GraphPage', async () => {
        const { getByText } = await renderWithRouter(paths.GRAPH);
        expect(getByText('GraphPage')).toBeInTheDocument();
    });
});
