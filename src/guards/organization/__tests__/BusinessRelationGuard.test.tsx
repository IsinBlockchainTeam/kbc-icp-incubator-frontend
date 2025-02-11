import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { BusinessRelationGuard } from '@/guards/organization/BusinessRelationGuard';
import { InformationDisclosureModal } from '@/components/InformationDisclosureModal/InformationDisclosureModal';
import { Organization } from '@kbc-lib/coffee-trading-management-lib';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('@/providers/entities/icp/OrganizationProvider', () => ({
    useOrganization: jest.fn()
}));

jest.mock('@/components/InformationDisclosureModal/InformationDisclosureModal', () => ({
    InformationDisclosureModal: jest.fn(() => null)
}));

describe('BusinessRelationGuard', () => {
    const mockGetOrganization = jest.fn();
    const mockOrganization: Organization = {
        ethAddress: '0x123',
        legalName: 'Test Organization'
    } as Organization;

    beforeEach(() => {
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: mockGetOrganization
        });
        mockGetOrganization.mockReturnValue(mockOrganization);
        (InformationDisclosureModal as jest.Mock).mockClear();
    });

    it('should pass supplier organization when user is commissioner', () => {
        const supplierAddress = '0x456';
        const commissionerAddress = '0x789';
        
        (useSelector as jest.Mock).mockReturnValue({
            roleProof: { delegator: commissionerAddress }
        });

        render(
            <BusinessRelationGuard
                supplierEthAddress={supplierAddress}
                commissionerEthAddress={commissionerAddress}
            />
        );

        expect(mockGetOrganization).toHaveBeenCalledWith(supplierAddress);
        expect(InformationDisclosureModal).toHaveBeenCalledWith(
            { otherOrganization: mockOrganization },
            expect.any(Object)
        );
    });

    it('should pass commissioner organization when user is supplier', () => {
        const supplierAddress = '0x456';
        const commissionerAddress = '0x789';
        
        (useSelector as jest.Mock).mockReturnValue({
            roleProof: { delegator: supplierAddress }
        });

        render(
            <BusinessRelationGuard
                supplierEthAddress={supplierAddress}
                commissionerEthAddress={commissionerAddress}
            />
        );

        expect(mockGetOrganization).toHaveBeenCalledWith(commissionerAddress);
        expect(InformationDisclosureModal).toHaveBeenCalledWith(
            { otherOrganization: mockOrganization },
            expect.any(Object)
        );
    });
});