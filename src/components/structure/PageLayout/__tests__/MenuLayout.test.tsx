import React from 'react';
import { act, render } from '@testing-library/react';
import { PageLayout } from '../PageLayout';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { MemoryRouter } from 'react-router-dom';
import { initialState, updateUserInfo, UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Menu } from 'antd';
import { paths } from '@/constants/paths';
import { useWalletConnect } from '@/providers/WalletConnectProvider';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Menu: jest.fn(() => <div>Menu</div>)
}));
jest.mock('@/providers/WalletConnectProvider');

describe('MenuLayout', () => {
    const mockDisconnect = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useWalletConnect as jest.Mock).mockReturnValue({
            disconnect: mockDisconnect
        });
    });
    it('should render menu when user is not logged in', () => {
        render(
            <MemoryRouter
                initialEntries={[{ pathname: '/test' }]}
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}>
                <Provider store={store}>
                    <PageLayout />
                </Provider>
            </MemoryRouter>
        );
        const mockedMenu = Menu as unknown as jest.Mock;
        expect(mockedMenu).toHaveBeenCalledTimes(2);
        const primaryMenuItems = mockedMenu.mock.calls[0][0].items;
        expect(primaryMenuItems).toHaveLength(6);
        expect(primaryMenuItems[0].key).toBe(paths.TRADES);
        expect(primaryMenuItems[1].key).toBe(paths.DOCUMENTS);
        expect(primaryMenuItems[2].key).toBe(paths.MATERIALS);
        expect(primaryMenuItems[3].key).toBe(paths.PARTNERS);
        expect(primaryMenuItems[4].key).toBe(paths.OFFERS);
        expect(primaryMenuItems[5].key).toBe(paths.CERTIFICATIONS);

        const secondaryMenuItems = mockedMenu.mock.calls[1][0].items;
        expect(secondaryMenuItems).toHaveLength(1);
        expect(secondaryMenuItems[0].key).toBe('settings');

        expect(secondaryMenuItems[0].children).toHaveLength(1);
        expect(secondaryMenuItems[0].children[0].key).toBe(paths.LOGIN);
    });
    it('should render menu when user is logged in', () => {
        store.dispatch(
            updateUserInfo({
                subjectDid: '1',
                companyClaims: {
                    legalName: 'Test Company'
                },
                employeeClaims: {
                    lastName: 'Test User'
                }
            } as UserInfoState)
        );
        render(
            <MemoryRouter
                initialEntries={[{ pathname: '/test' }]}
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}>
                <Provider store={store}>
                    <PageLayout />
                </Provider>
            </MemoryRouter>
        );
        const mockedMenu = Menu as unknown as jest.Mock;
        expect(mockedMenu).toHaveBeenCalledTimes(2);
        const primaryMenuItems = mockedMenu.mock.calls[0][0].items;
        expect(primaryMenuItems).toHaveLength(6);
        expect(primaryMenuItems[0].key).toBe(paths.TRADES);
        expect(primaryMenuItems[1].key).toBe(paths.DOCUMENTS);
        expect(primaryMenuItems[2].key).toBe(paths.MATERIALS);
        expect(primaryMenuItems[3].key).toBe(paths.PARTNERS);
        expect(primaryMenuItems[4].key).toBe(paths.OFFERS);
        expect(primaryMenuItems[5].key).toBe(paths.CERTIFICATIONS);

        const secondaryMenuItems = mockedMenu.mock.calls[1][0].items;
        expect(secondaryMenuItems).toHaveLength(1);
        expect(secondaryMenuItems[0].key).toBe('profile');

        expect(secondaryMenuItems[0].children).toHaveLength(2);
        expect(secondaryMenuItems[0].children[0].key).toBe(paths.PROFILE);
        expect(secondaryMenuItems[0].children[1].key).toBe(paths.LOGIN);

        act(() => secondaryMenuItems[0].children[1].onClick());
        expect(store.getState().userInfo).toEqual(initialState);
        expect(store.getState().siweIdentity).toEqual({
            isLogged: false,
            address: '',
            sessionIdentity: '',
            delegationChain: ''
        });
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
});
