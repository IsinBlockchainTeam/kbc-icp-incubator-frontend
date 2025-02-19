import { Layout, Spin, theme } from 'antd';
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './ContentLayout.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import loadingLogo from '@/assets/coffee-loading.gif';

const { Content, Footer } = Layout;

type Props = {
    children?: ReactNode;
};

export const ContentLayout = ({ children }: Props) => {
    const {
        token: { colorBgContainer }
    } = theme.useToken();

    const loading = useSelector((state: RootState) => state.loading);

    return (
        <Layout>
            <Content className={styles.MainContent} style={{ background: colorBgContainer }}>
                <Spin
                    indicator={
                        <img
                            src={loadingLogo}
                            alt="loading..."
                            style={{
                                width: 150,
                                height: 'auto',
                                marginLeft: -70,
                                marginTop: -100
                            }}
                        />
                    }
                    size={'large'}
                    spinning={loading.isLoading}
                    tip={Object.keys(loading.loadingMessages).map((msg) => (
                        <div key={msg}>{msg}</div>
                    ))}>
                    {children ? children : <Outlet />}
                </Spin>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Coffee Trading platform ©2025 Created by ISIN</Footer>
        </Layout>
    );
};
