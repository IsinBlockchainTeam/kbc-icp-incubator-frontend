import { Layout } from 'antd';
import React, { ReactNode } from 'react';
import AlcomexLogo from '@/assets/logo.png';
import styles from './BasicLayout.module.scss';
import { ContentLayout } from '@/layout/ContentLayout/ContentLayout';

const { Sider } = Layout;

type Props = {
    children?: ReactNode;
};

export const BasicLayout = ({ children }: Props) => {
    return (
        <>
            <Sider width="max(250px, 12vw)" collapsed={false}>
                <div className={styles.Sidebar}>
                    <div className={styles.LogoContainer}>
                        <img alt="Alcomex-Logo" src={AlcomexLogo} className={`${styles.Logo}`} />
                    </div>
                </div>
            </Sider>

            <ContentLayout>{children}</ContentLayout>
        </>
    );
};
