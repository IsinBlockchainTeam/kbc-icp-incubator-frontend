import { useNavigate } from 'react-router-dom';
import ProductCategoryNew from '../ProductCategoryNew';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useProductCategory } from '@/providers/icp/ProductCategoryProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/icp/ProductCategoryProvider');

describe('Product Category New', () => {
    const saveProductCategory = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useProductCategory as jest.Mock).mockReturnValue({
            saveProductCategory
        });
    });

    it('should render correctly', () => {
        render(<ProductCategoryNew />);

        expect(screen.getByText('New Product Category')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'delete Delete Product Category' })
        ).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                confirmText: 'Are you sure you want to create this product category?',
                submittable: true,
                onSubmit: expect.any(Function)
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(4);
    });

    it('should call onSubmit function when clicking on submit button', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        render(<ProductCategoryNew />);

        const values = {
            name: 'product category 1',
            quality: 1,
            description: 'description 1'
        };
        await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);

        expect(saveProductCategory).toHaveBeenCalledTimes(1);
        expect(saveProductCategory).toHaveBeenCalledWith(
            values.name,
            values.quality,
            values.description
        );
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });

    it("should navigate to 'Materials' when clicking on 'Delete Product Category' button", async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (saveProductCategory as jest.Mock).mockRejectedValue(
            new Error('Error saving product category')
        );
        render(<ProductCategoryNew />);

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'delete Delete Product Category' }));
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.MATERIALS);
    });
});
