import React from 'react';
import { Outlet } from 'react-router-dom';
import { BasicLayout } from '@/layout/BasicLayout/BasicLayout';

const PublicRoutes = () => {
    return (
        <BasicLayout>
            <Outlet />
        </BasicLayout>
    );
};

export default PublicRoutes;
