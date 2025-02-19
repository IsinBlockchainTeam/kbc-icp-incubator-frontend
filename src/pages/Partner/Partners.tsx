import { CardPage } from '@/components/CardPage/CardPage';
import React from 'react';
import { ColumnsType } from 'antd/es/table';
import { Avatar, Button, Table, Typography } from 'antd';
import { useBusinessRelation } from '@/providers/entities/icp/BusinessRelationProvider';
import { BusinessRelation, Organization, OrganizationVisibilityLevel } from '@kbc-lib/coffee-trading-management-lib';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export const Partners = () => {
    const { businessRelations } = useBusinessRelation();
    const { getOrganization } = useOrganization();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();

    const partnerInfo = {
        title: 'Business Partners Network',
        items: [
            <Text>
                This table show all partnerships established with other organizations in your organization's network.
            </Text>,
            <>
                <Text strong>
                    {'Partnership Meaning: '}
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>
                        Verified business identities
                    </li>
                    <li>
                        Access to partner certifications
                    </li>
                    <li>
                        Access to partner complete identity data
                    </li>
                </ul>
            </>
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/partnership.png'
    };

    const columns: ColumnsType<Organization> = [
        {
            title: '',
            dataIndex: 'image',
            render: (image) => {
                if (!image) {
                    return <Avatar size={80} icon={<StopOutlined />} />;
                }
                return <Avatar size={80} src={image} />;
            }
        },
        {
            title: 'Name',
            dataIndex: 'legalName',
            sorter: (a, b) => a.legalName.localeCompare(b.legalName),
            sortDirections: ['descend']
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (role) => {
                if (!role) {
                    return 'Not Available';
                }
                return role;
            }
        },
        {
            title: 'Contact details',
            key: 'contactDetails',
            render: (organization) => {
                if (organization.visibilityLevel === OrganizationVisibilityLevel.NARROW) {
                    return 'Not Available';
                }
                return (
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex' }}>
                            <MailOutlined style={{ marginRight: 4 }} />
                            <p style={{ margin: 5 }}>{organization.email}</p>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <PhoneOutlined style={{ marginRight: 4 }} />
                            <p style={{ margin: 5 }}>{organization.telephone}</p>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            <p style={{ margin: 5 }}>
                                {organization.address}, {organization.city},{organization.postalCode}, {organization.region},{' '}
                                {organization.countryCode}
                            </p>
                        </div>
                    </span>
                );
            }
        }
    ];

    const partners: Organization[] = businessRelations.map((businessRelation: BusinessRelation) => {
        const organizationAddress =
            userInfo.roleProof.delegator === businessRelation.ethAddressA ? businessRelation.ethAddressB : businessRelation.ethAddressA;
        return getOrganization(organizationAddress);
    });

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Partners
                    <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(paths.PARTNER_INVITE)}>
                            Invite new Partner
                        </Button>
                    </div>
                </div>
            }>
            <InfoCard {...partnerInfo} />
            <Table columns={columns} dataSource={partners} rowKey={'legalName'} />
        </CardPage>
    );
};

export default Partners;
