import { defaultPictureURL } from '@/constants/misc';
import { Avatar, Menu } from 'antd';
import React from 'react';
import { resetUserInfo, UserInfoState } from '@/redux/reducers/userInfoSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import { clearSiweIdentity } from '@/redux/reducers/siweIdentitySlice';
import { getItem, MenuItem } from '@/components/Menu/menu-item';

type Props = {
    userInfo: UserInfoState;
    dispatch: Dispatch;
    disconnect: () => void;
    onMenuClick: (key: any) => void;
};

export const ProfileMenuItem = (props: Props) => {
    const settingItems: MenuItem[] = [getItem('Settings', 'settings', <SettingOutlined />, [getItem('Login', paths.LOGIN, <UserOutlined />)])];

    const getUserItemLoggedIn = (name: string, picture: string, dispatch: Dispatch, disconnect: () => void) => [
        getItem(`${name}`, 'profile', <Avatar size={30} style={{ verticalAlign: 'middle', margin: '-6px' }} src={picture} />, [
            getItem('Profile', paths.PROFILE, <UserOutlined />),
            getItem('Logout', paths.LOGIN, <LogoutOutlined />, undefined, undefined, () => {
                dispatch(resetUserInfo());
                dispatch(clearSiweIdentity());
                disconnect();
            })
        ])
    ];

    return (
        <Menu
            theme="dark"
            mode="vertical"
            items={
                props.userInfo.isLogged
                    ? getUserItemLoggedIn(
                          props.userInfo.employeeClaims.lastName + ', ' + props.userInfo.companyClaims.legalName,
                          props.userInfo.employeeClaims.image || defaultPictureURL,
                          props.dispatch,
                          props.disconnect
                      )
                    : settingItems
            }
            onClick={props.onMenuClick}
        />
    );
};

export default ProfileMenuItem;
