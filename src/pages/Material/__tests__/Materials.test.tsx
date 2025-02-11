import { act, render, screen } from '@testing-library/react';
import Materials from '../Materials';
import userEvent from '@testing-library/user-event';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useProductCategory } from '@/providers/entities/icp/ProductCategoryProvider';
import { useMaterial } from '@/providers/entities/icp/MaterialProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/icp/ProductCategoryProvider');
jest.mock('@/providers/entities/icp/MaterialProvider');

describe('Materials', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        const productCategories = [new ProductCategory(1, 'Product category 1'), new ProductCategory(2, 'Product category 2')];
        (useMaterial as jest.Mock).mockReturnValue({
            materials: [
                new Material(1, 'owner1', 'name1', productCategories[0], 'typology1', 'quality1', 'moisture1', true),
                new Material(2, 'owner2', 'name2', productCategories[1], 'typology2', 'quality2', 'moisture2', false)
            ]
        });
        (useProductCategory as jest.Mock).mockReturnValue({
            productCategories
        });
    });

    it('should render correctly', async () => {
        render(<Materials />);

        expect(screen.getByText('Product Categories')).toBeInTheDocument();
        expect(screen.getByText('Materials')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'plus New Material' })).toBeInTheDocument();
        expect(screen.getAllByText('name1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('name2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 1')[1]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Product category 2')[1]).toBeInTheDocument();
        expect(screen.getAllByText('typology1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('typology2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('quality1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('quality2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('moisture1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('moisture2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Input')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Output')[0]).toBeInTheDocument();
    });

    it('should call sorter function correctly when clicking on product categories table header', async () => {
        render(<Materials />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 1');
        expect(tableRows[2]).toHaveTextContent('2Product category 2');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('2Product category 2');
        expect(tableRows[2]).toHaveTextContent('1Product category 1');

        act(() => {
            userEvent.click(screen.getAllByText('Name')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 1');
        expect(tableRows[2]).toHaveTextContent('2Product category 2');

        act(() => {
            userEvent.click(screen.getAllByText('Quality')[0]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[1]).toHaveTextContent('1Product category 1');
        expect(tableRows[2]).toHaveTextContent('2Product category 2');
    });

    it('should call sorter function correctly when clicking on material table header', async () => {
        render(<Materials />);

        let tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');
        expect(tableRows[5]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');

        act(() => {
            userEvent.click(screen.getAllByText('Id')[1]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');
        expect(tableRows[5]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');

        act(() => {
            userEvent.click(screen.getAllByText('Name')[1]);
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');
        expect(tableRows[5]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');

        act(() => {
            userEvent.click(screen.getByText('Product category'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');
        expect(tableRows[5]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');

        act(() => {
            userEvent.click(screen.getByText('Typology'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');
        expect(tableRows[5]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');

        act(() => {
            userEvent.click(screen.getByText('Quality'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');
        expect(tableRows[5]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');

        act(() => {
            userEvent.click(screen.getByText('Moisture'));
        });

        tableRows = screen.getAllByRole('row');
        expect(tableRows).toHaveLength(6);
        expect(tableRows[4]).toHaveTextContent('1name1Product category 1typology1quality1moisture1Input');
        expect(tableRows[5]).toHaveTextContent('2name2Product category 2typology2quality2moisture2Output');
    });
});
