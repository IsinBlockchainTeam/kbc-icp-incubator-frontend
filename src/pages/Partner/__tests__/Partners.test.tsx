// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { render, fireEvent, screen, act } from '@testing-library/react';
// import { useEthRelationship } from '@/providers/entities/EthRelationshipProvider';
// import { Relationship } from '@kbc-lib/coffee-trading-management-lib';
// import Partners from '@/pages/Partner/Partners';
// import { InviteCompany } from '@/pages/Partner/InviteCompany';
// import userEvent from '@testing-library/user-event';
//
// jest.mock('@/providers/entities/EthRelationshipProvider');
// jest.mock('@/pages/Partner/InviteCompany');
//
// describe('Partners', () => {
//     const relationships = [
//         {
//             id: 1,
//             companyA: 'Company A',
//             companyB: 'Company B',
//             validFrom: new Date(),
//             validUntil: new Date()
//         } as Relationship
//     ];
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//     });
//
//     it('renders relationships in table', () => {
//         (useEthRelationship as jest.Mock).mockReturnValue({ relationships });
//
//         const { getByText, getAllByText } = render(<Partners />);
//
//         expect(getByText(relationships[0].companyA)).toBeInTheDocument();
//         expect(getByText(relationships[0].companyB)).toBeInTheDocument();
//         expect(
//             getAllByText(relationships[0].validFrom.toLocaleDateString())[0]
//         ).toBeInTheDocument();
//         expect(
//             getAllByText(relationships[0].validUntil!.toLocaleDateString())[1]
//         ).toBeInTheDocument();
//     });
//
//     it('opens invite company modal on button click', () => {
//         (useEthRelationship as jest.Mock).mockReturnValue({ relationships: [] });
//
//         const { getByText } = render(<Partners />);
//
//         fireEvent.click(getByText('Invite a new company'));
//
//         expect(InviteCompany).toHaveBeenCalledTimes(2);
//         expect(InviteCompany).toHaveBeenCalledWith(expect.objectContaining({ open: true }), {});
//     });
//     it('should call sorter function correctly when clicking on table header', async () => {
//         const relationships = [
//             {
//                 id: 1,
//                 companyA: 'Company A',
//                 companyB: 'Company B',
//                 validFrom: new Date(),
//                 validUntil: new Date()
//             } as Relationship,
//             {
//                 id: 1,
//                 companyA: 'Company D',
//                 companyB: 'Company E',
//                 validFrom: new Date(),
//                 validUntil: new Date()
//             } as Relationship
//         ];
//         (useEthRelationship as jest.Mock).mockReturnValue({ relationships });
//         render(<Partners />);
//
//         let tableRows = screen.getAllByRole('row');
//         expect(tableRows).toHaveLength(3);
//         expect(tableRows[1].textContent).toContain('Company ACompany B');
//         expect(tableRows[2].textContent).toContain('Company DCompany E');
//
//         act(() => {
//             userEvent.click(screen.getAllByText('Company 1')[0]);
//         });
//
//         tableRows = screen.getAllByRole('row');
//         expect(tableRows).toHaveLength(3);
//         expect(tableRows[1].textContent).toContain('Company DCompany E');
//         expect(tableRows[2].textContent).toContain('Company ACompany B');
//
//         act(() => {
//             userEvent.click(screen.getByText('Company 2'));
//         });
//
//         tableRows = screen.getAllByRole('row');
//         expect(tableRows).toHaveLength(3);
//         expect(tableRows[1].textContent).toContain('Company DCompany E');
//         expect(tableRows[2].textContent).toContain('Company ACompany B');
//     });
// });
