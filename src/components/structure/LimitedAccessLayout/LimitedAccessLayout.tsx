import { Layout } from 'antd';
import React, { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import KBCLogo from '@/assets/logo.png';
import styles from './LimitedAccessLayout.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { paths } from '@/constants/paths';
import { useWalletConnect } from '@/providers/auth/WalletConnectProvider';
import { ContentLayout } from '@/components/structure/ContentLayout/ContentLayout';
import ProfileMenuItem from '@/components/Menu/ProfileMenuItem';

const { Sider } = Layout;

type Props = {
    children?: ReactNode;
};

export const LimitedAccessLayout = ({ children }: Props) => {
    const { disconnect } = useWalletConnect();
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
