import { act, render } from '@testing-library/react';
import Login from '@/pages/Login/Login';
import { Card } from 'antd';
import VeramoLogin from '@/pages/Login/VeramoLogin';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Card: jest.fn().mockReturnValue(() => <div />)
}));
jest.mock('@/pages/Login/VeramoLogin');

describe('Login', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly', async () => {
        render(<Login />);
        const mockedCard = Card as unknown as jest.Mock;
        expect(mockedCard).toHaveBeenCalled();
        expect(mockedCard).toHaveBeenCalledWith(
            {
                style: { width: '100%' },
                tabList: [{ key: 'vc_login', tab: 'Verifiable Credential Login' }],
                activeTabKey: 'vc_login',
                onTabChange: expect.any(Function),
                children: expect.anything()
            },
            {}
        );
        render(mockedCard.mock.calls[0][0].children);
        expect(VeramoLogin).toHaveBeenCalled();
    });
    it('should change tab', async () => {
        render(<Login />);
        const mockedCard = Card as unknown as jest.Mock;
        expect(mockedCard).toHaveBeenCalled();
        expect(mockedCard).toHaveBeenCalledWith(
            {
                style: { width: '100%' },
                tabList: [{ key: 'vc_login', tab: 'Verifiable Credential Login' }],
                activeTabKey: 'vc_login',
                onTabChange: expect.any(Function),
                children: expect.anything()
            },
            {}
        );
        act(() => {
            mockedCard.mock.calls[0][0].onTabChange('other');
        });
        expect(mockedCard).toHaveBeenCalledTimes(2);
    });
});
