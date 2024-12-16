import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';
import { paths } from '@/constants/paths';

type Props = {
    children?: ReactNode;
};

const AuthenticationGuard = ({ children }: Props) => {
    const { isLogged } = useSelector((state: RootState) => state.userInfo);

    if (!isLogged) {
        return <Navigate to={paths.LOGIN} />;
    }

    return <>{children}</>;
};

export default AuthenticationGuard;
