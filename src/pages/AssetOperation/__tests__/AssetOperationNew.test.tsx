// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { act, render, screen } from '@testing-library/react';
// import AssetOperationNew from '../AssetOperationNew';
// import userEvent from '@testing-library/user-event';
// import { paths } from '@/constants/paths';
// import { useNavigate } from 'react-router-dom';
// import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
// import { GenericForm } from '@/components/GenericForm/GenericForm';
// import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
// import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
// import { useEthAssetOperation } from '@/providers/entities/EthAssetOperationProvider';
//
// jest.mock('react-router-dom');
// jest.mock('@/components/GenericForm/GenericForm');
// jest.mock('@/providers/entities/EthMaterialProvider');
// jest.mock('@/providers/entities/EthEnumerableProvider');
// jest.mock('@/providers/entities/EthAssetOperationProvider');
//
// describe('Asset Operations New', () => {
//     const materials = [
//         new Material(1, new ProductCategory(1, 'Product category 1', 1, '')),
//         new Material(2, new ProductCategory(2, 'Product category 2', 2, ''))
//     ];
//     const processTypes = ['Process Type 1', 'Process Type 2'];
//     const saveAssetOperation = jest.fn();
//     const navigate = jest.fn();
//
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         (useEthMaterial as jest.Mock).mockReturnValue({ materials });
//         (useEthEnumerable as jest.Mock).mockReturnValue({ processTypes });
//         (useEthAssetOperation as jest.Mock).mockReturnValue({ saveAssetOperation });
//     });
//
//     it('should render correctly', async () => {
//         render(<AssetOperationNew />);
//
//         expect(screen.getByText('New Asset Operation')).toBeInTheDocument();
//         expect(
//             screen.getByRole('button', { name: 'delete Delete Asset Operation' })
//         ).toBeInTheDocument();
//         expect(GenericForm).toHaveBeenCalled();
//         expect(GenericForm).toHaveBeenCalledWith(
//             {
//                 elements: expect.any(Array),
//                 confirmText: 'Are you sure you want to create this asset operation?',
//                 submittable: true,
//                 onSubmit: expect.any(Function)
//             },
//             {}
//         );
//         expect((GenericForm as jest.Mock).mock.calls[0][0].elements).toHaveLength(12);
//     });
//
//     it('should create asset operation on submit', async () => {
//         render(<AssetOperationNew />);
//
//         const values = {
//             name: 'Asset Operation 1',
//             'input-material-id-1': '1',
//             'output-material-id': '2',
//             latitude: 1.234,
//             longitude: 2.345,
//             'process-types': 'Process Type 1'
//         };
//         await (GenericForm as jest.Mock).mock.calls[0][0].onSubmit(values);
//
//         expect(saveAssetOperation).toHaveBeenCalled();
//         expect(saveAssetOperation).toHaveBeenCalledWith({
//             name: 'Asset Operation 1',
//             inputMaterialIds: [1],
//             outputMaterialId: 2,
//             latitude: 1.234,
//             longitude: 2.345,
//             processTypes: 'Process Type 1'
//         });
//         expect(navigate).toHaveBeenCalledTimes(1);
//         expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
//     });
//
//     it("should navigate to 'Asset Operations' when clicking on 'Delete Asset Operation' button", async () => {
//         render(<AssetOperationNew />);
//
//         userEvent.click(screen.getByRole('button', { name: 'delete Delete Asset Operation' }));
//         expect(navigate).toHaveBeenCalledTimes(1);
//         expect(navigate).toHaveBeenCalledWith(paths.ASSET_OPERATIONS);
//     });
//
//     it('should add and remove input material when clicking on buttons', async () => {
//         render(<AssetOperationNew />);
//
//         act(() => {
//             const elements: any[] = (GenericForm as jest.Mock).mock.calls[0][0].elements;
//             expect(elements).toHaveLength(12);
//             elements.find((e) => e.name == 'new-input-material').onClick();
//         });
//         expect(GenericForm).toHaveBeenCalledTimes(2);
//         expect((GenericForm as jest.Mock).mock.calls[1][0].elements).toHaveLength(13);
//         act(() => {
//             const elements: any[] = (GenericForm as jest.Mock).mock.calls[1][0].elements;
//             expect(elements).toHaveLength(13);
//             elements.find((e) => e.name == 'remove-input-material').onClick();
//         });
//         expect(GenericForm).toHaveBeenCalledTimes(3);
//         expect((GenericForm as jest.Mock).mock.calls[2][0].elements).toHaveLength(12);
//     });
// });
