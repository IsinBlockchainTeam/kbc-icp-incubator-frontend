import React, { useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Button, Space, Table } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import Search from '@/components/Search/Search';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { paths } from '@/constants/paths';
import { credentials } from '@/constants/ssi';
import { ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useOffer } from '@/providers/icp/OfferProvider';
import { useOrganization } from '@/providers/icp/OrganizationProvider';

type OfferPresentable = {
    id: number;
    supplierAddress: string;
    supplierName: string;
    productCategory: ProductCategory;
};
export const Offers = () => {
    const { offers } = useOffer();
    const { getOrganization } = useOrganization();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();
    const [productCategory, setProductCategory] = useState<string>('');

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
            sorter: (a, b) =>
                (a.productCategory.name || '').localeCompare(b.productCategory.name || '')
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => {
                if (userInfo.companyClaims.role.toUpperCase() === credentials.ROLE_IMPORTER) {
                    return (
                        <Space size="middle">
                            <a
                                role="start-negotiation"
                                onClick={() =>
                                    navigate(paths.TRADE_NEW, {
                                        state: {
                                            supplierAddress: record.supplierAddress,
                                            productCategoryId: record.productCategory.id
                                        }
                                    })
                                }>
                                Start a negotiation →
                            </a>
                        </Space>
                    );
                } else {
                    return <></>;
                }
            }
        }
    ];

    const filteredOffers = offers
        .filter((offer) =>
            offer.productCategory.name.toLowerCase().includes(productCategory.toLowerCase())
        )
        .map((offer) => ({
            id: offer.id,
            supplierName: getOrganization(offer.owner)!.legalName,
            supplierAddress: offer.owner,
            productCategory: offer.productCategory
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
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(paths.OFFERS_NEW)}>
                                New Offer
                            </Button>
                        </div>
                    )}
                </div>
            }>
            <Search placeholder="Search by product category" onSearchFn={setProductCategory} />
            <Table columns={columns} dataSource={filteredOffers} rowKey="id" />
        </CardPage>
    );
};

export default Offers;
