import { render, screen, waitFor } from '@testing-library/react';
import Materials from '../Materials';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import userEvent from '@testing-library/user-event';
import { BlockchainMaterialStrategy } from '@/api/strategies/material/BlockchainMaterialStrategy';
import { MaterialPresentable } from '@/api/types/MaterialPresentable';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/constants/paths';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../../api/services/EthMaterialService');
jest.mock('../../../api/strategies/material/BlockchainMaterialStrategy');

describe('Materials', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<Materials />);

        expect(screen.getByText('Materials')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Product Category' })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Material' })).toBeInTheDocument();
    });

    it('should fetch data', async () => {
        const mockedMaterials = [
            new MaterialPresentable(1, 'Material 1'),
            new MaterialPresentable(2, 'Material 2')
        ];
        const mockedGetMaterials = jest.fn().mockResolvedValueOnce(mockedMaterials);
        (EthMaterialService as jest.Mock).mockImplementation(() => ({
            getMaterials: mockedGetMaterials
        }));
        render(<Materials />);

        await waitFor(() => {
            expect(EthMaterialService).toHaveBeenCalledTimes(1);
            expect(BlockchainMaterialStrategy).toHaveBeenCalledTimes(1);
            expect(mockedGetMaterials).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Material 1')).toBeInTheDocument();
            expect(screen.getByText('Material 2')).toBeInTheDocument();
        });
    });

    it('should call onChange function when clicking on a table header', async () => {
        render(<Materials />);

        await waitFor(() => {
            userEvent.click(screen.getByText('Id'));
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        render(<Materials />);

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Product Category' }));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.PRODUCT_CATEGORY_NEW);
        });

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Material' }));
            expect(navigate).toHaveBeenCalledTimes(2);
            expect(navigate).toHaveBeenCalledWith(paths.MATERIAL_NEW);
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        const mockMaterials = [
            new MaterialPresentable(1, 'Material 1'),
            new MaterialPresentable(2, 'Material 2')
        ];
        const mockedGetMaterials = jest.fn().mockResolvedValueOnce(mockMaterials);
        (EthMaterialService as jest.Mock).mockImplementation(() => ({
            getMaterials: mockedGetMaterials
        }));
        render(<Materials />);

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('1Material 1');
            expect(tableRows[2]).toHaveTextContent('2Material 2');
        });

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('2Material 2');
            expect(tableRows[2]).toHaveTextContent('1Material 1');
        });

        userEvent.click(screen.getByText('Name'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('1Material 1');
            expect(tableRows[2]).toHaveTextContent('2Material 2');
        });
    });

    test('should sort also when working with falsy id', async () => {
        const mockMaterials = [
            new MaterialPresentable(1, 'Material 1'),
            new MaterialPresentable(undefined, 'Material 2')
        ];
        const mockedGetMaterials = jest.fn().mockResolvedValueOnce(mockMaterials);
        (EthMaterialService as jest.Mock).mockImplementation(() => ({
            getMaterials: mockedGetMaterials
        }));
        render(<Materials />);

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(3);
            expect(tableRows[1]).toHaveTextContent('1Material 1');
            expect(tableRows[2]).toHaveTextContent('Material 2');
        });
    });
});
