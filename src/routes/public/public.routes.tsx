import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { Login } from '@/pages/Login/Login';

const publicRoutes = (
    <>
        <Route path={paths.LOGIN} element={<Login />} />
        <Route path="*" element={<Navigate to={paths.LOGIN} />} />
    </>
);

export default publicRoutes;
