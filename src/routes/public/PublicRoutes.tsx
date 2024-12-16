import React from 'react';
import { Outlet } from 'react-router-dom';
import { BasicLayout } from '@/components/structure/BasicLayout/BasicLayout';

const PublicRoutes = () => {
    return (
        <BasicLayout>
            <Outlet />
        </BasicLayout>
    );
};

export default PublicRoutes;
