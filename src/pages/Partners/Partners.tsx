import {CardPage} from "../../components/structure/CardPage/CardPage";
import React, {useContext, useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {PartnershipPresentable} from "../../api/types/PartnershipPresentable";
import {InviteCompany} from "./InviteCompany";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useDispatch} from "react-redux";
import {EthContext} from "../../providers/EthProvider";

export const Partners = () => {
    const {ethPartnerService} = useContext(EthContext);
    const [partnership, setPartnership] = useState<PartnershipPresentable[]>();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const dispatch = useDispatch();

    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving partners..."));

            const partners = await ethPartnerService.getPartners();
            setPartnership(partners.map(p => {
                // @ts-ignore
                p['key'] = p.companyName;
                return p;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
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
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    return (
        <>
            <InviteCompany open={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CardPage title="Partners" extra={<a onClick={() => setIsModalOpen(true)}>Invite a new company</a>}>
                <Table columns={columns} dataSource={partnership} onChange={onChange} />
            </CardPage>
        </>
    )
}

export default Partners;
