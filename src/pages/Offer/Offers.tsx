import React, { useContext, useEffect, useState } from 'react';
import { NotificationType, openNotification } from '@/utils/notification';
import { ColumnsType } from 'antd/es/table';
import { Button, Space, Table, TableProps } from 'antd';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import Search from '@/components/Search/Search';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { EthContext } from '@/providers/EthProvider';
import { OfferPresentable } from '@/api/types/OfferPresentable';
import { ICPContext } from '@/providers/ICPProvider';
import { paths } from '@/constants/paths';
import { notificationDuration } from '@/constants/notification';
import { credentials, DID_METHOD } from '@/constants/ssi';

export const Offers = () => {
    const { ethOfferService } = useContext(EthContext);
    const { getNameByDID } = useContext(ICPContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [offers, setOffers] = useState<OfferPresentable[]>();
    const [filteredOffers, setFilteredOffers] = useState<OfferPresentable[]>();
    const loadData = async () => {
        try {
            dispatch(showLoading('Retrieving offers...'));
            const offers = await ethOfferService.getAllOffers();
            const offerPresentables: OfferPresentable[] = [];

            const names: Map<string, string> = new Map<string, string>();

            for (const offer of offers) {
                let supplierName = names.get(offer.owner);
                if (!supplierName) {
                    supplierName =
                        (await getNameByDID(DID_METHOD + ':' + offer.owner)) || 'Unknown';
                    names.set(offer.owner, supplierName);
                }
                offerPresentables.push({
                    id: offer.id,
                    supplierName,
                    supplierAddress: offer.owner,
                    productCategory: offer.productCategory
                });
            }

            setOffers(offerPresentables);
            setFilteredOffers(offerPresentables);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR, notificationDuration);
        } finally {
            dispatch(hideLoading());
        }
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
            sorter: (a, b) =>
                (a.productCategory.name || '').localeCompare(b.productCategory.name || '')
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => {
                if (userInfo.role === credentials.ROLE_IMPORTER) {
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

    const filterOffers = (productCategory: string) => {
        const filtered = offers?.filter((o) =>
            o.productCategory.name.toLowerCase().includes(productCategory.toLowerCase())
        );
        setFilteredOffers(filtered);
    };

    useEffect(() => {
        loadData();
        return () => {
            dispatch(hideLoading());
        };
    }, []);

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
                    {userInfo.role === credentials.ROLE_EXPORTER && (
                        <div>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(paths.OFFERS_SUPPLIER_NEW)}
                                style={{ marginRight: '16px' }}>
                                New Offer Supplier
                            </Button>
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
            <Search placeholder="Search by product category" onSearchFn={filterOffers} />
            <Table columns={columns} dataSource={filteredOffers} rowKey="id" />
        </CardPage>
    );
};

export default Offers;
