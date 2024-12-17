import React, { ReactNode } from 'react';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { paths } from '@/constants/paths';
import SyncDataLoader from '../../data-loaders/SyncDataLoader';
import NavigationBlocker from '@/guards/navigation/NavigationBlocker';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MenuLayout } from '@/layout/MenuLayout/MenuLayout';
import { LimitedAccessLayout } from '@/layout/LimitedAccessLayout/LimitedAccessLayout';

type Props = {
    children?: ReactNode;
};

const OrganizationGuard = ({ children }: Props) => {
    const { getOrganization } = useOrganization();

    const isOrganizationOnIcp = () => {
        const userInfo = useSelector((state: RootState) => state.userInfo);

        const organizationEthAddress = userInfo.roleProof.delegator;

        try {
            getOrganization(organizationEthAddress);

            return true;
        } catch (error) {
            return false;
        }
    };

    const Layout = isOrganizationOnIcp() ? MenuLayout : LimitedAccessLayout;

    return (
        <SyncDataLoader customUseContext={useOrganization}>
            <NavigationBlocker condition={isOrganizationOnIcp} redirectPath={paths.PROFILE}>
                <Layout>{children}</Layout>
            </NavigationBlocker>
        </SyncDataLoader>
    );
};

export default OrganizationGuard;
