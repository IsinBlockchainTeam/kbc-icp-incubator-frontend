import { Avatar, Layout, Menu, MenuProps } from 'antd';
import React, { useState } from 'react';
import {
    AuditOutlined,
    CloudDownloadOutlined,
    GoldOutlined,
    LogoutOutlined,
    SettingOutlined,
    SwapOutlined,
    TeamOutlined,
    UserOutlined,
    FileDoneOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { defaultPictureURL } from '@/constants/misc';
import KBCLogo from '@/assets/logo.png';
import styles from './MenuLayout.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { resetUserInfo } from '@/redux/reducers/userInfoSlice';
import { clearSiweIdentity } from '@/redux/reducers/siweIdentitySlice';
import { paths } from '@/constants/paths';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';
import { ContentLayout } from '@/components/structure/ContentLayout/ContentLayout';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
    onClick?: () => void
): MenuItem => {
    return {
        key,
        icon,
        children,
        label,
        type,
        onClick
    } as MenuItem;
};

const blockchainItems: MenuItem[] = [
    getItem('Trades', paths.TRADES, <SwapOutlined />),
    getItem('Documents', paths.DOCUMENTS, <CloudDownloadOutlined />),
    getItem('Materials', paths.MATERIALS, <GoldOutlined />),
    getItem('Partners', paths.PARTNERS, <TeamOutlined />),
    getItem('Offers', paths.OFFERS, <AuditOutlined />),
    getItem('Certifications', paths.CERTIFICATIONS, <FileDoneOutlined />)
];

const settingItems: MenuItem[] = [getItem('Settings', 'settings', <SettingOutlined />, [getItem('Login', paths.LOGIN, <UserOutlined />)])];

const getUserItemLoggedIn = (name: string, picture: string, dispatch: any, disconnect: () => void) => [
    getItem(`${name}`, 'profile', <Avatar size={30} style={{ verticalAlign: 'middle', margin: '-6px' }} src={picture} />, [
        getItem('Profile', paths.PROFILE, <UserOutlined />),
        getItem('Logout', paths.LOGIN, <LogoutOutlined />, undefined, undefined, () => {
            dispatch(resetUserInfo());
            dispatch(clearSiweIdentity());
            disconnect();
        })
    ])
];

export const MenuLayout = () => {
    const { disconnect } = useWalletConnect();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const dispatch = useDispatch();

    const userInfo = useSelector((state: RootState) => state.userInfo);

    // @ts-ignore
    const onMenuClick = ({ key }) => {
        navigate(key);
    };

    const getMenuItems = () => {
        return (
            <div className={styles.MenuContainer}>
                <Menu theme="dark" mode="inline" items={blockchainItems} selectedKeys={[location.pathname]} onClick={onMenuClick} />
                <Menu
                    theme="dark"
                    mode="vertical"
                    items={
                        userInfo.isLogged
                            ? getUserItemLoggedIn(
                                  userInfo.employeeClaims.lastName + ', ' + userInfo.companyClaims.legalName,
                                  userInfo.employeeClaims.image || defaultPictureURL,
                                  dispatch,
                                  disconnect
                              )
                            : settingItems
                    }
                    onClick={onMenuClick}
                />
            </div>
        );
    };

    return (
        <>
            <Sider width="max(250px, 12vw)" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className={styles.Sidebar}>
                    <Link to={paths.HOME} className={styles.LogoContainer}>
                        <img alt="KBC-Logo" src={KBCLogo} className={`${collapsed ? styles.LogoCollapsed : styles.Logo}`} />
                    </Link>
                    {getMenuItems()}
                </div>
            </Sider>

            <ContentLayout />
        </>
    );
};
