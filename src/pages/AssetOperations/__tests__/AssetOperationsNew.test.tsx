import { useNavigate } from 'react-router-dom';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { render, screen, waitFor } from '@testing-library/react';
import AssetOperationsNew from '../AssetOperationsNew';
import userEvent from '@testing-library/user-event';

import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../../api/services/AssetOperationService');
jest.mock('../../../../api/strategies/asset_operation/BlockchainAssetOperationStrategy');

describe('Asset Operations New', () => {
    const navigate = jest.fn();
    const mockedSaveTransformation = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (EthAssetOperationService as jest.Mock).mockImplementation(() => ({
            saveTransformation: mockedSaveTransformation
        }));
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<AssetOperationsNew />);

        expect(screen.getByText('New Asset Operation')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'delete Delete Asset Operation' })
        ).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Input Material ID')).toBeInTheDocument();
        expect(screen.getByText('Output Material ID')).toBeInTheDocument();
        expect(screen.getByText('Process Types')).toBeInTheDocument();
        expect(screen.getByText('Latitude')).toBeInTheDocument();
        expect(screen.getByText('Longitude')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        render(<AssetOperationsNew />);

        userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Test');
        userEvent.type(screen.getByRole('textbox', { name: 'Input Material ID' }), '1');
        userEvent.type(screen.getByRole('textbox', { name: 'Output Material ID' }), '2');
        userEvent.type(screen.getByRole('textbox', { name: 'Latitude' }), '40.730610');
        userEvent.type(screen.getByRole('textbox', { name: 'Longitude' }), '-73.935242');
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => {
            expect(mockedSaveTransformation).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
        });
    });

    it("should navigate to 'Asset Operations' when clicking on 'Delete Asset Operation' button", async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByRole('button', { name: 'delete Delete Asset Operation' }));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
        });
    });

    it("should add input material when clicking on 'Add Input Material' button", async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByText('New input material'));

        await waitFor(() => {
            const inputMaterials = screen.getAllByText('Input Material ID');
            expect(inputMaterials).toHaveLength(2);
        });
    });

    it('should call deleteInputMaterial function when clicking on delete button', async () => {
        render(<AssetOperationsNew />);

        userEvent.click(screen.getByText('New input material'));
        await waitFor(() => {
            expect(screen.getAllByText('Input Material ID')).toHaveLength(2);
        });

        userEvent.click(screen.getByText('Delete input material'));
        await waitFor(() => {
            expect(screen.getAllByText('Input Material ID')).toHaveLength(1);
        });
    });
});
