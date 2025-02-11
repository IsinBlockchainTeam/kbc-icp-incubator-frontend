import React from 'react';
import { Organization } from '@kbc-lib/coffee-trading-management-lib';
import { render, screen, fireEvent } from '@testing-library/react';
import { InformationDisclosureModal } from '../InformationDisclosureModal';
import { paths } from '@/constants/paths';

// Mock the react-router-dom useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

// Mock the BusinessRelationProvider hook
const mockDiscloseInformation = jest.fn();
const mockGetBusinessRelation = jest.fn();
jest.mock('@/providers/entities/icp/BusinessRelationProvider', () => ({
    useBusinessRelation: () => ({
        discloseInformation: mockDiscloseInformation,
        getBusinessRelation: mockGetBusinessRelation
    })
}));

describe('InformationDisclosureModal', () => {
    const mockOrganization: Organization = {
        ethAddress: '0x123',
        legalName: 'Test Company'
    } as Organization;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows modal when business relation check fails', () => {
        mockGetBusinessRelation.mockImplementation(() => {
            throw new Error('No relation found');
        });

        render(<InformationDisclosureModal otherOrganization={mockOrganization} />);

        expect(screen.getByText('The commissioner has requested visibility of your information. Would you like to disclose your information with the commissioner?')).toBeInTheDocument();
        expect(screen.getByText('Yes, disclose')).toBeInTheDocument();
        expect(screen.getByText('No, go back')).toBeInTheDocument();
    });

    test('does not show modal when business relation exists', () => {
        mockGetBusinessRelation.mockImplementation(() => Promise.resolve());

        render(<InformationDisclosureModal otherOrganization={mockOrganization} />);

        expect(screen.queryByText('The commissioner has requested visibility of your information. Would you like to disclose your information with the commissioner?')).not.toBeInTheDocument();
    });

    test('handles OK button click correctly', () => {
        mockGetBusinessRelation.mockImplementation(() => {
            throw new Error('No relation found');
        });

        render(<InformationDisclosureModal otherOrganization={mockOrganization} />);

        fireEvent.click(screen.getByText('Yes, disclose'));

        expect(mockDiscloseInformation).toHaveBeenCalledWith(mockOrganization.ethAddress);
    });

    test('handles Cancel button click correctly', () => {
        mockGetBusinessRelation.mockImplementation(() => {
            throw new Error('No relation found');
        });

        render(<InformationDisclosureModal otherOrganization={mockOrganization} />);

        fireEvent.click(screen.getByText('No, go back'));

        expect(mockNavigate).toHaveBeenCalledWith(paths.HOME);
    });
});