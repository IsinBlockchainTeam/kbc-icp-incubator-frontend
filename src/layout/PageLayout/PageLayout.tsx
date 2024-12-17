import { Layout } from 'antd';
import React, { ReactNode } from 'react';

import { Outlet } from 'react-router-dom';
import styles from './PageLayout.module.scss';

type Props = {
    children?: ReactNode;
};

export const PageLayout = ({ children }: Props) => {
    return <Layout className={styles.AppContainer}>{children ? children : <Outlet />}</Layout>;
};
