import React from 'react';
import { BroadedOrganization, OrganizationRole } from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import { BroadedOrganizationCard } from '@/components/OrganizationCards/BroadedOrganizationCard';

describe('BroadedOrganizationCard', () => {
    const mockOrganization: BroadedOrganization = {
        ethAddress: '0x123',
        legalName: 'Test Company',
        industrialSector: 'Industrial Sector Test',
        address: 'Address 1',
        city: 'City',
        postalCode: 'Postal Code',
        region: 'Region',
        countryCode: 'Country Code',
        role: OrganizationRole.IMPORTER,
        telephone: '123456789',
        email: 'Email Test',
        image: 'Image'
    } as BroadedOrganization;

    test('renders correctly', () => {
        render(<BroadedOrganizationCard organization={mockOrganization} />);

        expect(screen.getByText(mockOrganization.legalName)).toBeInTheDocument();
        expect(screen.getByText(mockOrganization.role)).toBeInTheDocument();
        expect(screen.getByText(mockOrganization.industrialSector)).toBeInTheDocument();
        expect(screen.getByText(mockOrganization.email)).toBeInTheDocument();
        expect(screen.getByText(mockOrganization.telephone)).toBeInTheDocument();
        expect(
            screen.getByText(
                `${mockOrganization.address}, ${mockOrganization.city}, ${mockOrganization.postalCode}, ${mockOrganization.region}, ${mockOrganization.countryCode}`
            )
        ).toBeInTheDocument();
    });
});
