import { useLocation, useNavigate } from 'react-router-dom';
import { render } from '@testing-library/react';
import { useSigner } from '@/providers/SignerProvider';
import { TradeNew } from '@/pages/Trade/New/TradeNew';
import { OrderTradeNew } from '@/pages/Trade/New/OrderTradeNew';
import { paths } from '@/constants/paths';
import { Wallet } from 'ethers';
import { useICPName } from '@/providers/entities/ICPNameProvider';

jest.mock('react-router-dom');
jest.mock('@/providers/SignerProvider');
jest.mock('@/pages/Trade/New/BasicTradeNew');
jest.mock('@/pages/Trade/New/OrderTradeNew');
jest.mock('@/providers/entities/ICPNameProvider');

describe('Trade New', () => {
    const signer = {
        address: '0x123'
    } as Wallet;
    const getName = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useLocation as jest.Mock).mockReturnValue({
            state: { supplierAddress: '0xaddress', productCategoryId: 1 }
        });
        (useSigner as jest.Mock).mockReturnValue({ signer });
        (useICPName as jest.Mock).mockReturnValue({ getName });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        getName.mockReturnValue('actor');
    });

    it('should render correctly - ORDER', async () => {
        render(<TradeNew />);

        expect(OrderTradeNew).toHaveBeenCalledTimes(1);
        const commonElements = (OrderTradeNew as jest.Mock).mock.calls[0][0].commonElements;
        expect(commonElements).toHaveLength(4);
        expect(commonElements[1].defaultValue).toEqual('actor');
        expect(commonElements[2].defaultValue).toEqual('actor');
        expect(commonElements[3].defaultValue).toEqual('actor');
    });

    it('should navigate to HOME if location is not valid', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            state: { supplierAddress: '0xaddress' }
        });
        render(<TradeNew />);
        expect(OrderTradeNew).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.HOME);
    });
});
