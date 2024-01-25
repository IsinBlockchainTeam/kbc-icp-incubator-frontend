import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {PartnerService} from "../../api/services/PartnerService";
import {CompanyPresentable} from "@unece/cotton-fetch";
import {LegacyPartnerStrategy} from "../../api/strategies/partner/LegacyPartnerStrategy";

export const LegacyPartners = () => {
    const [partners, setPartners] = useState<CompanyPresentable[]>();
    const loadData = async () => {
        try {
            const partnerService = new PartnerService(new LegacyPartnerStrategy());
            const partners = await partnerService.getPartners();
            setPartners(partners.map(p => {
                // @ts-ignore
                p['key'] = p.companyName;
                return p;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<CompanyPresentable> = [
        {
            title: 'Company',
            dataIndex: 'companyName',
            sorter: (a, b) => (a.companyName || '').localeCompare((b.companyName || '')),
            sortDirections: ['descend']
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (_, {role}) => {
                return role ? role.name : 'No role';
            }
        },
        {
            title: 'Address',
            dataIndex: 'address'
        }
    ];

    const onChange: TableProps<CompanyPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Partners">
            <Table columns={columns} dataSource={partners} onChange={onChange}/>
        </CardPage>
    )
}

export default LegacyPartners;
