import { useNavigate } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { paths } from '@/constants/paths';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import PartnerInvite from '@/pages/Partner/PartnerInvite';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/icp/OrganizationProvider');

describe('Partner Invite', () => {
    const inviteOrganization = jest.fn();
    const navigate = jest.fn();
    const submitValues = {
        email: 'email@email.ch',
        name: 'name'
    };

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (useOrganization as jest.Mock).mockReturnValue({ inviteOrganization });
    });

    it('should render correctly', async () => {
        render(<PartnerInvite />);
        expect(GenericForm).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Invite Partner')).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                confirmText: 'Are you sure you want to invite this company?',
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(3);
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<PartnerInvite />);

        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(submitValues);

        expect(inviteOrganization).toHaveBeenCalledTimes(1);
        expect(inviteOrganization).toHaveBeenCalledWith(submitValues.email, submitValues.name);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.PARTNERS);
    });
});
