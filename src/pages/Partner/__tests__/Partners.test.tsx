import { BroadedOrganization, BusinessRelation, NarrowedOrganization, OrganizationRole } from '@kbc-lib/coffee-trading-management-lib';
import { act, render, screen } from '@testing-library/react';
import { useBusinessRelation } from '@/providers/entities/icp/BusinessRelationProvider';
import Partners from '@/pages/Partner/Partners';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { useSelector } from 'react-redux';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';

jest.mock('react-router-dom');
jest.mock('@/providers/entities/icp/BusinessRelationProvider');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('react-redux');
jest.mock('@/components/InfoCard/InfoCard');
describe('Partners', () => {
    const partners = [
        new BroadedOrganization(
            '0x123',
            'Name 1',
            'Industrial sector 1',
            'Address 1',
            'City 1',
            'Postal code 1',
            'Region 1',
            'Country code 1',
            OrganizationRole.IMPORTER,
            'Telephone 1',
            'Email 1',
            'Image 1'
        ),
        new NarrowedOrganization('0x456', 'Name 2')
    ];
    const getOrganization = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        // jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        const userInfo = {
            roleProof: {
                delegator: '0xdelegator'
            }
        } as UserInfoState;
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        const businessRelations = [new BusinessRelation('0xdelegator', '0x123'), new BusinessRelation('0x456', '0xdelegator')];
        (useBusinessRelation as jest.Mock).mockReturnValue({
            businessRelations
        });
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization
        });
        getOrganization.mockReturnValueOnce(partners[0]);
        getOrganization.mockReturnValueOnce(partners[1]);
        getOrganization.mockReturnValue(partners[1]);
        (useNavigate as jest.Mock).mockReturnValue(navigate);
    });

    it('should render correctly', async () => {
        render(<Partners />);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Contact details')).toBeInTheDocument();
        expect(screen.getByText(partners[0].legalName)).toBeInTheDocument();
        expect(screen.getByText(partners[1].legalName)).toBeInTheDocument();
        expect(screen.getByText((partners[0] as BroadedOrganization).role)).toBeInTheDocument();
        expect(screen.getByText((partners[0] as BroadedOrganization).email)).toBeInTheDocument();
        expect(screen.getByText((partners[0] as BroadedOrganization).telephone)).toBeInTheDocument();
        expect(screen.getAllByText('Not Available')).toHaveLength(2);
    });

    it('should call sorter function correctly when clicking on table header', async () => {
        render(<Partners />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('Name 1IMPORTEREmail 1Telephone 1Address 1, City 1,Postal code 1, Region 1, Country code 1');
        expect(tableRows[2]).toHaveTextContent('Name 2Not AvailableNot Available');

        act(() => {
            userEvent.click(screen.getAllByText('Name')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(3);
        expect(tableRows[1]).toHaveTextContent('Name 2Not AvailableNot Available');
        expect(tableRows[2]).toHaveTextContent('Name 1IMPORTEREmail 1Telephone 1Address 1, City 1,Postal code 1, Region 1, Country code 1');
    });

    it("should navigate to Partner Invite page when clicking on 'Invite new company' buttons", async () => {
        render(<Partners />);

        act(() => {
            userEvent.click(screen.getByText('Invite new Partner'));
        });
        expect(navigate).toHaveBeenCalledWith(paths.PARTNER_INVITE);
    });
});
