import {MemoryRouter, useNavigate} from "react-router-dom";
import Trades from "../Trades";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {paths} from "../../../../constants";
import {TradePresentable} from "../../../../api/types/TradePresentable";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {TradeService} from "../../../../api/services/TradeService";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../../../api/services/TradeService');
jest.mock('../../../../api/strategies/trade/BlockchainTradeStrategy');
jest.mock('../../../../api/services/SolidServerService', () => ({}));
jest.mock('../../../../utils/utils', () => ({
    ...jest.requireActual('../../../../utils/utils'),
    checkAndGetEnvironmentVariable: jest.fn(),
}));

describe('Trades', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        render(<MemoryRouter>
            <Trades/>
        </MemoryRouter>);

        expect(screen.getByText('Trades')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'plus New Trade'})).toBeInTheDocument();
        expect(screen.getByText('Id')).toBeInTheDocument();
        expect(screen.getByText('Supplier')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should fetch data', async () => {
        const trade1: TradePresentable = new TradePresentable();
        trade1.setSupplier('Supplier 1')
            .setCustomer('Customer 1')
            .setType(TradeType.BASIC);
        const trade2: TradePresentable = new TradePresentable();
        trade2.setSupplier('Supplier 2')
            .setCustomer('Customer 2')
            .setType(TradeType.ORDER);
        const mockedTrades: TradePresentable[] = [trade1, trade2];
        const mockedGetGeneralTrades = jest.fn().mockResolvedValueOnce(mockedTrades);
        (TradeService as jest.Mock).mockImplementation(() => ({
            getGeneralTrades: mockedGetGeneralTrades
        }));
        render(
            <MemoryRouter>
                <Trades/>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(TradeService).toHaveBeenCalledTimes(1);
            expect(mockedGetGeneralTrades).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Supplier 1')).toBeInTheDocument();
            expect(screen.getByText('Customer 1')).toBeInTheDocument();
            expect(screen.getByText('Supplier 2')).toBeInTheDocument();
            expect(screen.getByText('Customer 2')).toBeInTheDocument();
        })
    });

    it('should call onChange function when clicking on a table header', async () => {
        render(<MemoryRouter>
            <Trades/>
        </MemoryRouter>);

        await waitFor(() => {
            userEvent.click(screen.getByText('Id'));
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    it('should call navigate when clicking on \'New Trade\' button', async () => {
        render(<MemoryRouter>
            <Trades/>
        </MemoryRouter>);

        await waitFor(() => {
            userEvent.click(screen.getByRole('button', {name: 'plus New Trade'}));
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW);
        });
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        const trade1: TradePresentable = new TradePresentable(1);
        trade1.setSupplier('Supplier 1')
            .setCustomer('Customer 2')
            .setType(TradeType.BASIC);
        const trade2: TradePresentable = new TradePresentable(2);
        trade2.setSupplier('Supplier 2')
            .setCustomer('Customer 1')
            .setType(TradeType.ORDER);
        const mockedTrades: TradePresentable[] = [trade1, trade2];
        const mockedGetGeneralTrades = jest.fn().mockResolvedValueOnce(mockedTrades);
        (TradeService as jest.Mock).mockImplementation(() => ({
            getGeneralTrades: mockedGetGeneralTrades
        }));
        render(
            <MemoryRouter>
                <Trades/>
            </MemoryRouter>
        );

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows[1]).toHaveTextContent('1Supplier 1Customer 2BASIC');
            expect(tableRows[2]).toHaveTextContent('2Supplier 2Customer 1ORDER');
        });

        userEvent.click(screen.getByText('Id'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows[1]).toHaveTextContent('2Supplier 2Customer 1ORDER');
            expect(tableRows[2]).toHaveTextContent('1Supplier 1Customer 2BASIC');
        });

        userEvent.click(screen.getByText('Supplier'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows[1]).toHaveTextContent('1Supplier 1Customer 2BASIC');
            expect(tableRows[2]).toHaveTextContent('2Supplier 2Customer 1ORDER');
        });

        userEvent.click(screen.getByText('Customer'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows[1]).toHaveTextContent('2Supplier 2Customer 1ORDER');
            expect(tableRows[2]).toHaveTextContent('1Supplier 1Customer 2BASIC');
        });
    }, 30000);

    it('should sort also when working with falsy customers', async () => {
        const trade0: TradePresentable = new TradePresentable(0);
        trade0.setSupplier('Supplier 0')
            .setType(TradeType.BASIC);
        const trade1: TradePresentable = new TradePresentable(1);
        trade1.setSupplier('Supplier 1')
            .setCustomer('Customer 1')
            .setType(TradeType.BASIC);
        const trade2: TradePresentable = new TradePresentable(2);
        trade2.setSupplier('Supplier 2')
            .setType(TradeType.ORDER);
        const mockedTrades: TradePresentable[] = [trade0, trade1, trade2];
        const mockedGetGeneralTrades = jest.fn().mockResolvedValueOnce(mockedTrades);
        (TradeService as jest.Mock).mockImplementation(() => ({
            getGeneralTrades: mockedGetGeneralTrades
        }));
        render(
            <MemoryRouter>
                <Trades/>
            </MemoryRouter>
        );

        userEvent.click(screen.getByText('Customer'));

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows[1]).toHaveTextContent('0Supplier 0-BASIC');
            expect(tableRows[2]).toHaveTextContent('2Supplier 2-ORDER');
            expect(tableRows[3]).toHaveTextContent('1Supplier 1Customer 1BASIC');
        });
    });
});