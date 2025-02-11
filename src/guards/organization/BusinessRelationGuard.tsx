import { InformationDisclosureModal } from '@/components/InformationDisclosureModal/InformationDisclosureModal';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

type Props = {
    supplierEthAddress: string;
    commissionerEthAddress: string;
};

export const BusinessRelationGuard = ({ supplierEthAddress, commissionerEthAddress }: Props) => {
    const { getOrganization } = useOrganization();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const organizationEthAddress = userInfo.roleProof.delegator;

    const otherOrganization = organizationEthAddress == supplierEthAddress ? commissionerEthAddress : supplierEthAddress;

    return <InformationDisclosureModal otherOrganization={getOrganization(otherOrganization)} />;
};