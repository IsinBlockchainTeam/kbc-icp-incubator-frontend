import {useNavigate} from "react-router-dom";
import Trades from "../Trades";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {paths} from "../../../../constants";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../../api/services/TradeService');
jest.mock('../../../../api/strategies/trade/BlockchainTradeStrategy');
jest.mock('../../../../utils/utils', () => ({
    checkAndGetEnvironmentVariable: jest.fn(),
    getEnumKeyByValue: jest.fn(),
    setParametersPath: jest.fn(),
}));
jest.mock('../../../../api/services/SolidServerService', () => ({}));

describe('Trades', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<Trades/>);

        expect(screen.getByText('Trades')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'plus New Trade'})).toBeInTheDocument();
        expect(screen.getByText('Id')).toBeInTheDocument();
        expect(screen.getByText('Supplier')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
    });

    // it('should fetch data', async () => {
    //     const trade1: TradePresentable = new TradePresentable();
    //     trade1.setSupplier('Supplier 1')
    //         .setCustomer('Customer 1')
    //         .setType(TradeType.BASIC);
    //     const trade2: TradePresentable = new TradePresentable();
    //     trade2.setSupplier('Supplier 2')
    //         .setCustomer('Customer 2')
    //         .setType(TradeType.ORDER);
    //     const mockedTrades: TradePresentable[] = [trade1, trade2];
    //     const mockedGetGeneralTrades = jest.fn().mockResolvedValueOnce(mockedTrades);
    //     (TradeService as jest.Mock).mockImplementation(() => ({
    //         getGeneralTrades: mockedGetGeneralTrades
    //     }));
    //     render(<Trades/>);
    //
    //     await waitFor(() => {
    //         expect(TradeService).toHaveBeenCalledTimes(1);
    //         expect(mockedGetGeneralTrades).toHaveBeenCalledTimes(1);
    //         expect(screen.getByText('Supplier 1')).toBeInTheDocument();
    //         expect(screen.getByText('Customer 1')).toBeInTheDocument();
    //         expect(screen.getByText('Supplier 2')).toBeInTheDocument();
    //         expect(screen.getByText('Customer 2')).toBeInTheDocument();
    //     })
    // });

    it('should call onChange function when clicking on a table header', async () => {
        render(<Trades/>);

        await waitFor(() => {
            userEvent.click(screen.getByText('Id'));
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    it('should call navigate when clicking on \'New Trade\' button', async () => {
        render(<Trades/>);

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', {name: 'plus New Trade'}));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW);
        });
    });
});