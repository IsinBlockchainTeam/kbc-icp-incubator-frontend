import { Layout } from 'antd';
import React from 'react';
import KBCLogo from '@/assets/logo.png';
import styles from './BasicLayout.module.scss';
import { ContentLayout } from '@/components/structure/ContentLayout/ContentLayout';

const { Sider } = Layout;

export const BasicLayout = () => {
    return (
        <>
            <Sider width="max(250px, 12vw)" collapsed={false}>
                <div className={styles.Sidebar}>
                    <div className={styles.LogoContainer}>
                        <img alt="KBC-Logo" src={KBCLogo} className={`${styles.Logo}`} />
                    </div>
                </div>
            </Sider>

            <ContentLayout />
        </>
    );
};
