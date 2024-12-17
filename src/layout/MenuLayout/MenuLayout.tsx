import { Layout, Menu } from 'antd';
import React, { ReactNode, useState } from 'react';
import { AuditOutlined, CloudDownloadOutlined, GoldOutlined, SwapOutlined, TeamOutlined, FileDoneOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import KBCLogo from '@/assets/logo.png';
import styles from './MenuLayout.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { paths } from '@/constants/paths';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';
import { ContentLayout } from '@/layout/ContentLayout/ContentLayout';
import ProfileMenuItem from '@/components/Menu/ProfileMenuItem';
import { getItem, MenuItem } from '@/components/Menu/menu-item';

const { Sider } = Layout;

const blockchainItems: MenuItem[] = [
    getItem('Trades', paths.TRADES, <SwapOutlined />),
    getItem('Documents', paths.DOCUMENTS, <CloudDownloadOutlined />),
    getItem('Materials', paths.MATERIALS, <GoldOutlined />),
    getItem('Partners', paths.PARTNERS, <TeamOutlined />),
    getItem('Offers', paths.OFFERS, <AuditOutlined />),
    getItem('Certifications', paths.CERTIFICATIONS, <FileDoneOutlined />)
];

type Props = {
    children?: ReactNode;
};

export const MenuLayout = ({ children }: Props) => {
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
                <ProfileMenuItem userInfo={userInfo} dispatch={dispatch} disconnect={disconnect} onMenuClick={onMenuClick} />
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

            <ContentLayout>{children}</ContentLayout>
        </>
    );
};
