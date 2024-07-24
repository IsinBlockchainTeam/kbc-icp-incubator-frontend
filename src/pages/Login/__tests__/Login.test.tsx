import { act, render } from '@testing-library/react';
import Login from '@/pages/Login/Login';
import { Card } from 'antd';
import VeramoLogin from '@/pages/Login/VeramoLogin';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Card: jest.fn().mockReturnValue(() => <div />)
}));
jest.mock('@/pages/Login/VeramoLogin');
jest.mock('@web3modal/ethers5/react');

describe('Login', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
        (useWeb3ModalAccount as jest.Mock).mockReturnValue({ isConnected: false });
    });

    it('should render correctly', () => {
        render(<Login />);
        const mockedCard = Card as unknown as jest.Mock;
        expect(mockedCard).toHaveBeenCalled();
        const tree = render(mockedCard.mock.calls[0][0].children);
        expect(tree.getByRole('wallet-connect-container')).toBeInTheDocument();
    });
    it('should change tab', () => {
        (useWeb3ModalAccount as jest.Mock).mockReturnValue({ isConnected: true });
        render(<Login />);
        const mockedCard = Card as unknown as jest.Mock;
        expect(mockedCard).toHaveBeenCalled();
        render(mockedCard.mock.calls[0][0].children);
        expect(VeramoLogin).toHaveBeenCalled();
    });
});
