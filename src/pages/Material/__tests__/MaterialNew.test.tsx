import { useNavigate } from 'react-router-dom';
import MaterialNew from '../MaterialNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthMaterialProvider');

describe('Materials New', () => {
    const saveMaterial = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthMaterial as jest.Mock).mockReturnValue({
            productCategories: [
                new ProductCategory(1, 'Product category 1', 1, ''),
                new ProductCategory(2, 'Product category 2', 2, '')
            ],
            saveMaterial
        });
    });

    it('should render correctly', async () => {
        render(<MaterialNew />);

        expect(screen.getByText('New Material')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete Delete Material' })).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                confirmText: 'Are you sure you want to create this material?',
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(2);
    });
    it('should create material on submit', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(<MaterialNew />);

        const values = {
            'product-category-id': 1
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);
        expect(saveMaterial).toHaveBeenCalledTimes(1);
        expect(saveMaterial).toHaveBeenCalledWith(1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });

    it("should navigate to 'Materials' when clicking on 'Delete Material' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(<MaterialNew />);

        act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Material' })));

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });
});
