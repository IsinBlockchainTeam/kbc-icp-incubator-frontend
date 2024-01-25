import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {PartnerService} from "../../api/services/PartnerService";
import {BlockchainPartnerStrategy} from "../../api/strategies/partner/BlockchainPartnerStrategy";
import {PartnershipPresentable} from "../../api/types/PartnershipPresentable";

export const Partners = () => {
    const [partnership, setPartnership] = useState<PartnershipPresentable[]>();
    const loadData = async () => {
        try {
            const partnerService = new PartnerService(new BlockchainPartnerStrategy());
            const partners = await partnerService.getPartners();
            setPartnership(partners.map(p => {
                // @ts-ignore
                p['key'] = p.companyName;
                return p;
            }));
        }
        catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<PartnershipPresentable> = [
        {
            title: 'Company',
            dataIndex: 'companyName',
            sorter: (a, b) => a.companyName.localeCompare(b.companyName),
            sortDirections: ['descend']
        },
        {
            title: 'Valid From',
            dataIndex: 'validFrom',
            render: (_, {validFrom}) => {
                return validFrom ? new Date(validFrom).toLocaleDateString() : 'No date';
            }
        },
        {
            title: 'Valid Until',
            dataIndex: 'validUntil',
            render: (_, {validUntil}) => {
                return validUntil ? new Date(validUntil).toLocaleDateString() : 'No date';
            }
        }
    ];

    const onChange: TableProps<PartnershipPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect( () => {
        loadData();
    }, []);

    return (
        <CardPage title="Partners">
            <Table columns={columns} dataSource={partnership} onChange={onChange} />
        </CardPage>
    )
}

export default Partners;
