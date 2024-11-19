import { act, render, screen, waitFor } from '@testing-library/react';
import Materials from '../Materials';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/icp/MaterialProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/icp/ProductCategoryProvider');
jest.mock('@/providers/icp/MaterialProvider');

describe('Materials', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        const productCategories = [
            new ProductCategory(1, 'Product category 1', 1, ''),
            new ProductCategory(2, 'Product category 2', 2, '')
        ];
        (useMaterial as jest.Mock).mockReturnValue({
            materials: [
                new Material(1, productCategories[0]),
                new Material(2, productCategories[1])
            ]
        });
        (useProductCategory as jest.Mock).mockReturnValue({
            productCategories
        });
    });

    it('should render correctly', async () => {
        render(<Materials />);

        expect(screen.getByText('Product Categories')).toBeInTheDocument();
        expect(screen.getByText('Your Materials')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'plus New Product Category' })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Material' })).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[1]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[1]).toBeInTheDocument();
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
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

    it('should call sorter function correctly when clicking on product categories table header', async () => {
        render(<Materials />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('2Product category 22');
        expect(tableRows[2]).toHaveTextContent('1Product category 11');

        act(() => {
            userEvent.click(screen.getByText('Name'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');

        act(() => {
            userEvent.click(screen.getByText('Quality'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 11');
        expect(tableRows[2]).toHaveTextContent('2Product category 22');
    });

    it('should call sorter function correctly when clicking on material table header', async () => {
        render(<Materials />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1Product category 1');
        expect(tableRows[5]).toHaveTextContent('2Product category 2');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[1]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('2Product category 2');
        expect(tableRows[5]).toHaveTextContent('1Product category 1');

        act(() => {
            userEvent.click(screen.getByText('Product category'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1Product category 1');
        expect(tableRows[5]).toHaveTextContent('2Product category 2');
    });
});
