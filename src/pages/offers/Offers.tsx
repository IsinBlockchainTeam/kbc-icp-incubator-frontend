import React, {useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {Button, Space, Table, TableProps} from "antd";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {OfferPresentable} from "../../api/types/OfferPresentable";
import {EthOfferService} from "../../api/services/EthOfferService";
import Search from "../../components/Search/Search";
import {PlusOutlined} from "@ant-design/icons";
import {credentials, paths} from "../../constants";
import {useNavigate} from "react-router-dom";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";

export const Offers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [offers, setOffers] = useState<OfferPresentable[]>();
    const [filteredOffers, setFilteredOffers] = useState<OfferPresentable[]>();
    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving offers..."))
            const offerService = new EthOfferService();
            const offers = await offerService.getAllOffers();
            setOffers(offers);
            setFilteredOffers(offers);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const columns: ColumnsType<OfferPresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend']
        },
        {
            title: 'Company',
            dataIndex: 'owner',
            sorter: (a, b) => (a.owner || '').localeCompare((b.owner || '')),
            sortDirections: ['descend']
        },
        {
            title: 'Product category',
            dataIndex: ['productCategory', 'name'],
            sorter: (a, b) => (a.productCategory.name || '').localeCompare((b.productCategory.name || '')),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => {
                if(userInfo.role === credentials.ROLE_IMPORTER){
                    return <Space size="middle">
                        <a onClick={() => navigate(
                            paths.TRADE_NEW,
                            {state: {supplierAddress: record.owner, productCategoryId: record.productCategory.id}}
                        )}>Start a negotiation →</a>
                    </Space>
                } else {
                    return <></>
                }
            },
        }
    ];

    const onChange: TableProps<OfferPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const filterOffers = (productCategory: string) => {
        console.log('Called')
        const filtered = offers?.filter(o => o.productCategory.name.toLowerCase().includes(productCategory.toLowerCase()));
        setFilteredOffers(filtered);
    }

    useEffect(() => {
        loadData();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    return (
        <CardPage title={<div
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            Offers
            {
                userInfo.role === credentials.ROLE_EXPORTER
                && <div>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.OFFERS_SUPPLIER_NEW)}
                            style={{marginRight: '16px'}}>
                        New Offer Supplier
                    </Button>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.OFFERS_NEW)}>
                        New Offer
                    </Button>
                </div>
            }
        </div>}>
            <Search placeholder="Search by product category" onSearchFn={filterOffers}/>
            <Table columns={columns} dataSource={filteredOffers} onChange={onChange} rowKey="id"/>
        </CardPage>
    )
}

export default Offers;
