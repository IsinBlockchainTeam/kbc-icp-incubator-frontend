import { render, screen } from '@testing-library/react';
import AssetOperationView from '../AssetOperationView';
import { useParams } from 'react-router-dom';
import { AssetOperation, Material } from '@kbc-lib/coffee-trading-management-lib';
import { GenericForm } from '@/components/GenericForm/GenericForm';
import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';

jest.mock('react-router-dom');
jest.mock('@/components/GenericForm/GenericForm');
jest.mock('@/providers/entities/EthAssetOperationProvider');

describe('Asset Operations View', () => {
    const assetOperations: AssetOperation[] = [
        {
            id: 1,
            name: 'Asset Operation 1',
            inputMaterials: [
                { productCategory: { name: 'Product Category 1' }, id: 1 } as Material,
                { productCategory: { name: 'Product Category 2' }, id: 2 } as Material
            ],
            outputMaterial: { productCategory: { name: 'Product Category 1' } }
        } as AssetOperation,
        {
            id: 2,
            name: 'Asset Operation 2',
            inputMaterials: [
                { productCategory: { name: 'Product Category 1' }, id: 1 } as Material,
                { productCategory: { name: 'Product Category 2' }, id: 2 } as Material
            ],
            outputMaterial: { productCategory: { name: 'Product Category 2' } }
        } as AssetOperation
    ];

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthAssetOperation as jest.Mock).mockReturnValue({ assetOperations });
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
    });

    it('should render correctly', async () => {
        render(<AssetOperationView />);

        expect(screen.getByText('Asset Operation')).toBeInTheDocument();
        expect(GenericForm).toHaveBeenCalled();
        expect(GenericForm).toHaveBeenCalledWith(
            {
                elements: expect.any(Array),
                submittable: false
            },
            {}
        );
        expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(11);
    });
    it('should render a default message if asset operation is not found', async () => {
        (useParams as jest.Mock).mockReturnValue({ id: '3' });
        render(<AssetOperationView />);

        expect(screen.getByText('Asset operation not available')).toBeInTheDocument();
        expect(GenericForm).not.toHaveBeenCalled();
    });
});
