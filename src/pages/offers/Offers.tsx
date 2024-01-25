import React, {useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {OfferPresentable} from "../../api/types/OfferPresentable";
import {OfferService} from "../../api/services/OfferService";
import {BlockchainOfferStrategy} from "../../api/strategies/offer/BlockchainOfferStrategy";
import Search from "../../components/Search/Search";

export const Offers = () => {
    const [offers, setOffers] = useState<OfferPresentable[]>();
    const [filteredOffers, setFilteredOffers] = useState<OfferPresentable[]>();
    const loadData = async () => {
        try {
            const offerService = new OfferService(new BlockchainOfferStrategy());
            const offers = await offerService.getAllOffers();
            setOffers(offers);
            setFilteredOffers(offers.map(t => {
                // @ts-ignore
                t['key'] = t.id;
                return t;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
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
            title: 'Material category',
            dataIndex: 'productCategory',
            sorter: (a, b) => (a.productCategory || '').localeCompare((b.productCategory || '')),
        }
    ];

    const onChange: TableProps<OfferPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const filterOffers = (productCategory: string) => {
        const filtered = offers?.filter(o => o.productCategory.toLowerCase().includes(productCategory.toLowerCase()));
        setFilteredOffers(filtered);
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Offers">
            <Search placeholder="Search by material category" onSearchFn={filterOffers} />
            <Table columns={columns} dataSource={filteredOffers} onChange={onChange}/>
        </CardPage>
    )
}

export default Offers;
