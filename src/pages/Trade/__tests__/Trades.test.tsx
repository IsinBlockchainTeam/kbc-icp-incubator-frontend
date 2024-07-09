export {};
// import { BrowserRouter, useNavigate } from 'react-router-dom';
// import Trades from '../Trades';
// import { render, screen, waitFor } from '@testing-library/react';
// import { TradeType } from '@kbc-lib/coffee-trading-management-lib';
// import userEvent from '@testing-library/user-event';
// import { TradePreviewPresentable } from '@/api/types/TradePresentable';
// import { EthTradeService } from '@/api/services/EthTradeService';
// import { paths } from '@/constants/paths';
//
// jest.mock('../../../../components/structure/CardPage/CardPage', () => ({
//     CardPage: ({ title, children }: any) => (
//         <div data-testid="card-page">
//             <div data-testid="title">{title}</div>
//             <div data-testid="body">{children}</div>
//         </div>
//     )
// }));
//
// jest.mock('antd', () => ({
//     ...jest.requireActual('antd'),
//     Button: ({ children, ...props }: any) => (
//         <div {...props} data-testid="button">
//             {children}
//         </div>
//     )
// }));
//
// jest.mock('@ant-design/icons', () => ({
//     ...jest.requireActual('@ant-design/icons'),
//     PlusOutlined: ({ children, ...props }: any) => (
//         <div {...props} data-testid="plus-outlined">
//             {children}
//         </div>
//     )
// }));
//
// jest.mock('../../../../utils/notification', () => ({
//     ...jest.requireActual('../../../../utils/notification'),
//     openNotification: jest.fn()
// }));
//
// jest.mock('../../../../utils/utils', () => ({
//     ...jest.requireActual('../../../../utils/utils'),
//     checkAndGetEnvironmentVariable: jest.fn()
// }));
//
// jest.mock('../../../../api/services/EthTradeService');
//
// jest.mock('../../../../api/strategies/trade/BlockchainTradeStrategy', () => ({
//     BlockchainTradeStrategy: jest.fn()
// }));
//
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: jest.fn()
// }));
//
// describe('Trades', () => {
//     const navigate = jest.fn();
//     const mockGetGeneralTrades = jest.fn();
//     let mockTrades: TradePreviewPresentable[];
//
//     beforeAll(() => {
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//     });
//
//     beforeEach(() => {
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         mockTrades = [
//             new TradePreviewPresentable(1, [], 'supplier1', TradeType.BASIC).setCustomer(
//                 'customer1'
//             ),
//             new TradePreviewPresentable(2, [], 'supplier2', TradeType.ORDER).setCustomer(
//                 'customer2'
//             )
//         ];
//     });
//
//     afterEach(() => jest.clearAllMocks());
//
//     const _renderTrades = () => {
//         mockGetGeneralTrades.mockReturnValue(mockTrades);
//         (EthTradeService as jest.Mock).mockImplementation(() => ({
//             getGeneralTrades: mockGetGeneralTrades
//         }));
//         return render(
//             <BrowserRouter>
//                 <Trades />
//             </BrowserRouter>
//         );
//     };
//
//     it('should render correctly', () => {
//         const tree = render(<Trades />);
//
//         const card = tree.getByTestId('card-page');
//         expect(card).toBeInTheDocument();
//
//         const title = card.querySelector('[data-testid="title"]');
//         expect(title).toBeInTheDocument();
//         expect(title).toHaveTextContent('Trades');
//         const button = tree.getByTestId('button');
//         expect(button).toBeInTheDocument();
//         expect(button).toHaveTextContent('New Trade');
//
//         const body = card.querySelector('[data-testid="body"]');
//         expect(body).toBeInTheDocument();
//         const table = tree.getByRole('table');
//         expect(table).toBeInTheDocument();
//         expect(table).toHaveTextContent('Id');
//         expect(table).toHaveTextContent('Supplier');
//         expect(table).toHaveTextContent('Customer');
//         expect(table).toHaveTextContent('Type');
//     });
//
//     it('should fetch data', async () => {
//         const tree = _renderTrades();
//
//         await waitFor(() => {
//             expect(EthTradeService).toHaveBeenCalledTimes(1);
//             expect(BlockchainTradeStrategy).toHaveBeenCalledTimes(1);
//             expect(mockGetGeneralTrades).toHaveBeenCalledTimes(1);
//
//             const tableRows = tree.getAllByRole('row');
//             expect(tableRows).toHaveLength(3);
//             expect(tableRows[1]).toHaveTextContent('1supplier1customer1');
//             expect(tableRows[2]).toHaveTextContent('2supplier2customer2');
//         });
//     });
//
//     it("should call navigate function when clicking on 'New Trade' button", async () => {
//         _renderTrades();
//
//         userEvent.click(screen.getByTestId('button'));
//
//         await waitFor(() => {
//             expect(navigate).toHaveBeenCalledTimes(1);
//             expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW);
//         });
//     });
//
//     it('should call sorter function when clicking on a table header', async () => {
//         _renderTrades();
//
//         userEvent.click(screen.getByText('Id'));
//
//         await waitFor(() => {
//             const tableRows = screen.getAllByRole('row');
//             expect(tableRows).toHaveLength(3);
//             expect(tableRows[1]).toHaveTextContent('2supplier2customer2');
//             expect(tableRows[2]).toHaveTextContent('1supplier1customer1');
//         });
//
//         userEvent.click(screen.getByText('Supplier'));
//
//         await waitFor(() => {
//             const tableRows = screen.getAllByRole('row');
//             expect(tableRows).toHaveLength(3);
//             expect(tableRows[1]).toHaveTextContent('1supplier1customer1');
//             expect(tableRows[2]).toHaveTextContent('2supplier2customer2');
//         });
//
//         userEvent.click(screen.getByText('Customer'));
//
//         await waitFor(() => {
//             const tableRows = screen.getAllByRole('row');
//             expect(tableRows).toHaveLength(3);
//             expect(tableRows[1]).toHaveTextContent('1supplier1customer1');
//             expect(tableRows[2]).toHaveTextContent('2supplier2customer2');
//         });
//     });
//
//     it('should work also with falsy customers', async () => {
//         mockTrades = [
//             new TradePreviewPresentable(1, [], 'supplier1', TradeType.BASIC),
//             new TradePreviewPresentable(2, [], 'supplier2', TradeType.ORDER).setCustomer(
//                 'customer2'
//             ),
//             new TradePreviewPresentable(3, [], 'supplier3', TradeType.BASIC)
//         ];
//         _renderTrades();
//
//         userEvent.click(screen.getByText('Customer'));
//
//         await waitFor(() => {
//             const tableRows = screen.getAllByRole('row');
//             expect(tableRows).toHaveLength(4);
//             expect(tableRows[1]).toHaveTextContent('1supplier1-BASIC');
//             expect(tableRows[2]).toHaveTextContent('3supplier3-BASIC');
//             expect(tableRows[3]).toHaveTextContent('2supplier2customer2ORDER');
//         });
//     });
// });
