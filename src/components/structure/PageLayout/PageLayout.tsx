import { Layout } from 'antd';
import React from 'react';

import { Outlet } from 'react-router-dom';
import styles from './PageLayout.module.scss';

export const PageLayout = () => {
    return (
        <Layout className={styles.AppContainer}>
            <Outlet />
        </Layout>
    );
};
