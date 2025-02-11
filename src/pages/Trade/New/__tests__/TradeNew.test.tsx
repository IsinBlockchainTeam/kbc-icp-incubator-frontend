import { render } from '@testing-library/react';
import { TradeNew } from '@/pages/Trade/New/TradeNew';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { paths } from '@/constants/paths';
import { Material, Organization, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useSession } from '@/providers/auth/SessionProvider';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn()
}));

jest.mock('@/providers/auth/SessionProvider', () => ({
    useSession: jest.fn()
}));

jest.mock('@/providers/entities/icp/OrganizationProvider', () => ({
    useOrganization: jest.fn()
}));

jest.mock('@/pages/Trade/New/OrderTradeNew', () => ({
    OrderTradeNew: jest.fn(() => null)
}));
describe('Trade New', () => {
    const mockUseNavigate = useNavigate as jest.Mock;
    const mockUseLocation = useLocation as jest.Mock;
    const mockUseSession = useSession as jest.Mock;
    const mockUseOrganization = useOrganization as jest.Mock;

    const mockGetOrganization = jest.fn();
    const mockGetLoggedOrganization = jest.fn();
    const mockNavigate = jest.fn();
    const supplierMaterial = new Material(1, 'owner1', 'name1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false);

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        mockNavigate.mockReset();
        mockUseNavigate.mockReturnValue(mockNavigate);
        mockUseLocation.mockReturnValue({ state: { supplierAddress: 'supplierAddress', material: supplierMaterial } });
        mockUseOrganization.mockReturnValue({ getOrganization: mockGetOrganization });
        mockUseSession.mockReturnValue({ getLoggedOrganization: mockGetLoggedOrganization });
        mockGetOrganization.mockImplementation((address: string) => ({ legalName: `${address}Name` }));
        mockGetLoggedOrganization.mockReturnValue({ ethAddress: 'customerAddress', legalName: 'customerAddressName' } as Organization);
    });

    it('navigates to home if location state is undefined', () => {
        mockUseLocation.mockReturnValueOnce({});
        render(<TradeNew />);
        expect(mockNavigate).toHaveBeenCalledWith(paths.HOME);
    });

    it('renders OrderTradeNew with correct props', () => {
        render(<TradeNew />);
        expect(OrderTradeNew).toHaveBeenCalledWith(
            expect.objectContaining({
                supplierAddress: 'supplierAddress',
                customerAddress: 'customerAddress',
                supplierMaterial: supplierMaterial,
                commonElements: expect.arrayContaining([
                    expect.objectContaining({ label: 'Supplier', defaultValue: 'supplierAddressName' }),
                    expect.objectContaining({ label: 'Customer', defaultValue: 'customerAddressName' }),
                    expect.objectContaining({ label: 'Commissioner', defaultValue: 'customerAddressName' })
                ])
            }),
            {}
        );
    });
});
