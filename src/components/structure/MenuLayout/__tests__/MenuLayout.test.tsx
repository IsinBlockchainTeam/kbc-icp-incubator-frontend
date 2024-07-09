import React from 'react';
import { act, render } from '@testing-library/react';
import { MenuLayout } from '../MenuLayout';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { MemoryRouter } from 'react-router-dom';
import { updateUserInfo, UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Menu } from 'antd';

import { paths } from '@/constants/paths';

jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    Menu: jest.fn(() => <div>Menu</div>)
}));

describe('MenuLayout', () => {
    it('should render menu when user is not logged in', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/test' }]}>
                <Provider store={store}>
                    <MenuLayout />
                </Provider>
            </MemoryRouter>
        );
        const mockedMenu = Menu as unknown as jest.Mock;
        expect(mockedMenu).toHaveBeenCalledTimes(2);
        const primaryMenuItems = mockedMenu.mock.calls[0][0].items;
        expect(primaryMenuItems).toHaveLength(5);
        expect(primaryMenuItems[0].key).toBe(paths.TRADES);
        expect(primaryMenuItems[1].key).toBe(paths.MATERIALS);
        expect(primaryMenuItems[2].key).toBe(paths.ASSET_OPERATIONS);
        expect(primaryMenuItems[3].key).toBe(paths.PARTNERS);
        expect(primaryMenuItems[4].key).toBe(paths.OFFERS);

        const secondaryMenuItems = mockedMenu.mock.calls[1][0].items;
        expect(secondaryMenuItems).toHaveLength(1);
        expect(secondaryMenuItems[0].key).toBe('settings');

        expect(secondaryMenuItems[0].children).toHaveLength(1);
        expect(secondaryMenuItems[0].children[0].key).toBe(paths.LOGIN);
    });
    it('should render menu when user is logged in', () => {
        store.dispatch(
            updateUserInfo({
                id: '1',
                legalName: 'Test User'
            } as UserInfoState)
        );
        render(
            <MemoryRouter initialEntries={[{ pathname: '/test' }]}>
                <Provider store={store}>
                    <MenuLayout />
                </Provider>
            </MemoryRouter>
        );
        const mockedMenu = Menu as unknown as jest.Mock;
        expect(mockedMenu).toHaveBeenCalledTimes(2);
        const primaryMenuItems = mockedMenu.mock.calls[0][0].items;
        expect(primaryMenuItems).toHaveLength(5);
        expect(primaryMenuItems[0].key).toBe(paths.TRADES);
        expect(primaryMenuItems[1].key).toBe(paths.MATERIALS);
        expect(primaryMenuItems[2].key).toBe(paths.ASSET_OPERATIONS);
        expect(primaryMenuItems[3].key).toBe(paths.PARTNERS);
        expect(primaryMenuItems[4].key).toBe(paths.OFFERS);

        const secondaryMenuItems = mockedMenu.mock.calls[1][0].items;
        expect(secondaryMenuItems).toHaveLength(1);
        expect(secondaryMenuItems[0].key).toBe('profile');

        expect(secondaryMenuItems[0].children).toHaveLength(2);
        expect(secondaryMenuItems[0].children[0].key).toBe(paths.PROFILE);
        expect(secondaryMenuItems[0].children[1].key).toBe(paths.LOGIN);

        act(() => secondaryMenuItems[0].children[1].onClick());
        expect(store.getState().userInfo).toEqual({
            isLogged: false,
            id: '',
            legalName: '',
            email: '',
            address: '',
            nation: '',
            telephone: '',
            image: '',
            role: '',
            organizationId: '',
            privateKey: ''
        });
        expect(store.getState().siweIdentity).toEqual({
            isLogged: false,
            address: '',
            sessionIdentity: '',
            delegationChain: ''
        });
    });
});
