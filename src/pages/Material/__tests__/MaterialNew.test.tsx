import { useNavigate } from 'react-router-dom';
import MaterialNew from '../MaterialNew';
import { render, screen, waitFor } from '@testing-library/react';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../api/services/EthMaterialService');
jest.mock('../../../api/strategies/material/BlockchainMaterialStrategy');

describe('Materials New', () => {
    const navigate = jest.fn();
    const mockedSaveMaterial = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (EthMaterialService as jest.Mock).mockImplementation(() => ({
            saveMaterial: mockedSaveMaterial
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<MaterialNew />);

        expect(screen.getByText('New Material')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Material' })).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Product Category ID')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<MaterialNew />);

        userEvent.type(screen.getByRole('textbox', { name: 'Product Category ID' }), '1');
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => {
            expect(mockedSaveMaterial).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
        });
    });

    it("should navigate to 'Materials' when clicking on 'Delete Material' button", async () => {
        render(<MaterialNew />);

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Material' }));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
        });
    });
});
