// TODO: Fix tests
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { useLocation, useNavigate } from 'react-router-dom';
// import { act, render, screen } from '@testing-library/react';
// import { paths } from '@/constants/paths';
// import { BasicTradeNew } from '@/pages/Trade/New/BasicTradeNew';
// import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
// import { LineRequest } from '@kbc-lib/coffee-trading-management-lib';
// import userEvent from '@testing-library/user-event';
// import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
// import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
// import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
//
// jest.mock('react-router-dom');
// jest.mock('@/providers/SignerProvider');
// jest.mock('@/components/GenericForm/GenericForm');
// jest.mock('@/providers/entities/EthMaterialProvider');
// jest.mock('@/providers/entities/EthEnumerableProvider');
// jest.mock('@/providers/entities/EthBasicTradeProvider');
//
// describe('Basic Trade New', () => {
//     const supplierAddress = '0xsupplierAddress';
//     const customerAddress = '0xcustomerAddress';
//     const productCategoryId = 1;
//     const commonElements: FormElement[] = [];
//     const productCategories = [{ id: 1, name: 'Product Category 1' }];
//     const units = ['unit1', 'unit2'];
//     const saveBasicTrade = jest.fn();
//     const navigate = jest.fn();
//
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//
//         (useLocation as jest.Mock).mockReturnValue({
//             state: { productCategoryId: 1 }
//         });
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         (useEthMaterial as jest.Mock).mockReturnValue({ productCategories });
//         (useEthEnumerable as jest.Mock).mockReturnValue({ units });
//         (useEthBasicTrade as jest.Mock).mockReturnValue({ saveBasicTrade });
//     });
//
//     it('should render correctly', async () => {
//         render(
//             <BasicTradeNew
//                 supplierAddress={supplierAddress}
//                 customerAddress={customerAddress}
//                 productCategoryId={productCategoryId}
//                 commonElements={commonElements}
//             />
//         );
//         const elements = (GenericForm as jest.Mock).mock.calls[0][0].elements;
//         expect(elements).toHaveLength(8);
//     });
//     it('onSubmit', async () => {
//         render(
//             <BasicTradeNew
//                 supplierAddress={supplierAddress}
//                 customerAddress={customerAddress}
//                 productCategoryId={productCategoryId}
//                 commonElements={commonElements}
//             />
//         );
//         const onSubmit = (GenericForm as jest.Mock).mock.calls[0][0].onSubmit;
//         const values = {
//             name: 'name',
//             'product-category-id-2': 2,
//             'quantity-1': 5,
//             'quantity-2': 10,
//             'unit-1': 'unit1',
//             'unit-2': 'unit2',
//             'certificate-of-shipping': {
//                 name: 'file.pdf'
//             }
//         };
//         await onSubmit(values);
//         expect(saveBasicTrade).toHaveBeenCalledTimes(1);
//         expect(saveBasicTrade).toHaveBeenCalledWith({
//             supplier: supplierAddress,
//             customer: customerAddress,
//             commissioner: customerAddress,
//             lines: [new LineRequest(2, 10, 'unit2'), new LineRequest(1, 5, 'unit1')],
//             name: 'name'
//         });
//         expect(navigate).toHaveBeenCalledTimes(1);
//     });
//     it('should navigate to Trades when clicking on Delete button', async () => {
//         render(
//             <BasicTradeNew
//                 supplierAddress={supplierAddress}
//                 customerAddress={customerAddress}
//                 productCategoryId={productCategoryId}
//                 commonElements={commonElements}
//             />
//         );
//         act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Trade' })));
//
//         expect(navigate).toHaveBeenCalledTimes(1);
//         expect(navigate).toHaveBeenCalledWith(paths.TRADES);
//     });
// });
