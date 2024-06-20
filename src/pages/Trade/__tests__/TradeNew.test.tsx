export {};
// import { OrderStatus, TradeType } from '@kbc-lib/coffee-trading-management-lib';
// import { TradeNew } from '../TradeNew';
// import { act, fireEvent, render, screen } from '@testing-library/react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { paths } from '@/constants/paths';
// import useTradeNew from '@/pages/Trade/logic/tradeNew';
// import OrderForm from '@/pages/Trade/OrderForm';
// import { GenericForm } from '@/components/GenericForm/GenericForm';
// import userEvent from '@testing-library/user-event';
//
// jest.mock('react-router-dom');
// jest.mock('../logic/tradeNew');
// jest.mock('@/components/GenericForm/GenericForm');
// jest.mock('@/pages/Trade/OrderForm');
//
// describe('TradeNew', () => {
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//         (useLocation as jest.Mock).mockReturnValue({
//             state: { supplierAddress: '0x123', productCategoryId: 1 }
//         });
//     });
//
//     it('should render correctly if trade is order', () => {
//         (useTradeNew as jest.Mock).mockReturnValue({
//             type: TradeType.ORDER,
//             elements: [],
//             onSubmit: jest.fn()
//         });
//         render(<TradeNew />);
//
//         expect(screen.getByText('New Trade')).toBeInTheDocument();
//         expect(screen.getByRole('button', { name: 'delete Delete Trade' })).toBeInTheDocument();
//         expect(OrderForm).toHaveBeenCalledTimes(1);
//         expect(OrderForm).toHaveBeenCalledWith(
//             {
//                 status: OrderStatus.CONTRACTING,
//                 submittable: true,
//                 negotiationElements: []
//             },
//             {}
//         );
//     });
//
//     it('should render correctly if trade is basic', () => {
//         (useTradeNew as jest.Mock).mockReturnValue({
//             type: TradeType.BASIC,
//             elements: [],
//             onSubmit: jest.fn()
//         });
//         render(<TradeNew />);
//
//         expect(screen.getByText('New Trade')).toBeInTheDocument();
//         expect(screen.getByRole('button', { name: 'delete Delete Trade' })).toBeInTheDocument();
//         expect(GenericForm).toHaveBeenCalledTimes(1);
//         expect(GenericForm).toHaveBeenCalledWith(
//             {
//                 elements: [],
//                 submittable: true,
//                 onSubmit: expect.any(Function)
//             },
//             {}
//         );
//     });
//
//     it('should navigate to trades page when delete button is clicked', () => {
//         const navigate = jest.fn();
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         (useTradeNew as jest.Mock).mockReturnValue({
//             type: TradeType.ORDER,
//             elements: [],
//             onSubmit: jest.fn()
//         });
//         render(<TradeNew />);
//         act(() => userEvent.click(screen.getByRole('button', { name: 'delete Delete Trade' })));
//
//         expect(navigate).toHaveBeenCalledTimes(1);
//         expect(navigate).toHaveBeenCalledWith(paths.TRADES);
//     });
// });
