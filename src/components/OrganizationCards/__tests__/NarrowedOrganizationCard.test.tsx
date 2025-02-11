import React from 'react';
import { NarrowedOrganization } from '@kbc-lib/coffee-trading-management-lib';
import { render, screen } from '@testing-library/react';
import { NarrowedOrganizationCard } from '../NarrowedOrganizationCard';

describe('NarrowedOrganizationCard', () => {
    const mockOrganization: NarrowedOrganization = {
        ethAddress: '0x123',
        legalName: 'Test Company'
    } as NarrowedOrganization;

    test('renders correctly', () => {
        render(<NarrowedOrganizationCard organization={mockOrganization} />);

        expect(screen.getByText(mockOrganization.legalName)).toBeInTheDocument();
    });
});
