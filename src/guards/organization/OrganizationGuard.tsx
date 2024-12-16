import React from 'react';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { paths } from '@/constants/paths';
import SyncDataLoader from '../../data-loaders/SyncDataLoader';
import NavigationBlocker from '../../NavigationBlocker';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MenuLayout } from '@/components/structure/MenuLayout/MenuLayout';
import { BasicLayout } from '@/components/structure/BasicLayout/BasicLayout';

const OrganizationGuard = () => {
    const isOrganizationOnIcp = () => {
        const { getOrganization } = useOrganization();
        const userInfo = useSelector((state: RootState) => state.userInfo);

        const organizationEthAddress = userInfo.roleProof.delegator;

        try {
            getOrganization(organizationEthAddress);

            return true;
        } catch (error) {
            return false;
        }
    };

    const Layout = isOrganizationOnIcp() ? MenuLayout : BasicLayout;

    return (
        <SyncDataLoader customUseContext={useOrganization}>
            <NavigationBlocker condition={isOrganizationOnIcp} redirectPath={paths.PROFILE}>
                <Layout />
            </NavigationBlocker>
        </SyncDataLoader>
    );
};

export default OrganizationGuard;
