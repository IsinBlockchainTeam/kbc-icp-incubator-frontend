import React, { ReactNode } from 'react';
import { BasicLayout } from '@/layout/BasicLayout/BasicLayout';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';

type Props = {
    children?: ReactNode;
};

const LoadingLayoutHandler = ({ children }: Props) => {
    const { dataLoaded } = useOrganization();

    const LoadingLayout = !dataLoaded ? BasicLayout : React.Fragment;

    return <LoadingLayout>{children}</LoadingLayout>;
};

export default LoadingLayoutHandler;
