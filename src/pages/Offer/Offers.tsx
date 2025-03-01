import React, { useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Button, Flex, Table, Typography } from 'antd';
import { CardPage } from '@/components/CardPage/CardPage';
import Search from '@/components/Search/Search';
import { ArrowRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useOffer } from '@/providers/entities/icp/OfferProvider';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { CertificationsInfoGroup } from '@/components/CertificationsInfo/CertificationsInfoGroup';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export type OfferPresentable = {
    id: number;
    owner: string;
    supplierAddress: string;
    supplierName: string;
    material: Material;
    productCategory: ProductCategory;
};

export const Offers = () => {
    const { offers, deleteOffer } = useOffer();
    const { getOrganization } = useOrganization();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();
    const [productCategory, setProductCategory] = useState<string>('');

    const offerInfo = {
        title: 'Coffee Trading Offers',
        items: [
            <Text>
                This table contains all offers created by exporters. It is a marketplace for trade between exporters and importers.
            </Text>,
            <>
                <Text strong>
                    {'Roles & Actions: '}
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>
                        Exporters can create and manage offers
                    </li>
                    <li>
                        Importers can view offers and start negotiations
                    </li>
                    <li>
                        Both parties can track certifications and product details
                    </li>
                </ul>
            </>,
            <>
                <Text strong>
                    {'Trading Process: '}
                </Text>
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>
                        Exporter creates offer with product specifications
                    </li>
                    <li>
                        Importer reviews available offers and certifications
                    </li>
                    <li>
                        Negotiation begins when importer selects an offer
                    </li>
                    <li>
                        Both parties proceed with trade documentation
                    </li>
                </ol>
            </>,
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/marketplace.png'
    };

    const columns: ColumnsType<OfferPresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend']
        },
        {
            title: 'Company',
            dataIndex: 'supplierName',
            sorter: (a, b) => (a.supplierName || '').localeCompare(b.supplierName || ''),
            sortDirections: ['descend']
        },
        {
            title: 'Product category',
            dataIndex: ['productCategory', 'name'],
            sorter: (a, b) => (a.productCategory.name || '').localeCompare(b.productCategory.name || '')
        },
        {
            title: 'Certifications',
            render: (record) => {
                return <CertificationsInfoGroup company={record.supplierAddress} materialId={2} />;
            }
        },
        {
            title: 'Actions',
            key: 'action',
            render: (record) => {
                let startNegotiationAction = <></>;
                let deleteAction = <></>;
                if (userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_IMPORTER) {
                    startNegotiationAction = (
                        <Button
                            icon={<ArrowRightOutlined />}
                            role="start-negotiation"
                            onClick={() =>
                                navigate(paths.TRADE_NEW, {
                                    state: {
                                        supplierAddress: record.supplierAddress,
                                        material: record.material
                                    }
                                })
                            }>
                            Start a negotiation
                        </Button>
                    );
                }
                if (userInfo.roleProof.delegator === record.owner) {
                    deleteAction = (
                        <ConfirmButton
                            danger
                            icon={<DeleteOutlined />}
                            role="delete-offer"
                            confirmText={'Are you sure you want to delete this offer?'}
                            onConfirm={() => deleteOffer(record.id)}
                            text={'Delete'}
                        />
                    );
                }
                return (
                    <Flex wrap gap="small">
                        {startNegotiationAction}
                        {deleteAction}
                    </Flex>
                );
            }
        }
    ];

    const filteredOffers = offers
        .filter((offer) => offer.material.productCategory.name.toLowerCase().includes(productCategory.toLowerCase()))
        .map((offer) => ({
            id: offer.id,
            owner: offer.owner,
            supplierName: getOrganization(offer.owner).legalName,
            supplierAddress: offer.owner,
            material: offer.material,
            productCategory: offer.material.productCategory
        }));

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Offers
                    {userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_EXPORTER && (
                        <div>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(paths.OFFERS_NEW)}>
                                New Offer
                            </Button>
                        </div>
                    )}
                </div>
            }>
            <InfoCard {...offerInfo} />
            <Search placeholder="Search by product category" onSearchFn={setProductCategory} />
            <Table columns={columns} dataSource={filteredOffers} rowKey="id" />
        </CardPage>
    );
};

export default Offers;
