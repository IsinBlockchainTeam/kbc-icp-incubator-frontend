import {ColumnsType} from "antd/es/table";
import {Table, TableProps, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {setParametersPath} from "../../utils/utils";
import {TableTradePresentable} from "@unece/cotton-fetch";

type Props = {
    path: string,
    getData: () => Promise<TableTradePresentable[]>
}

interface TradeType extends TableTradePresentable {
    key: React.Key
}
export const TradeTable = (props: Props) => {
    const [tableRows, setTableRows] = useState<TradeType[]>([]);

    const columns: ColumnsType<TradeType> = [
        {
            title: 'Ref Number',
            dataIndex: 'contractorReferenceNumber',
            sorter: (a, b) => (a.contractorReferenceNumber || '').localeCompare(b.contractorReferenceNumber || ''),
            sortDirections: ['descend'],
            render: ((contractorNumber, {id}) => {
                return (
                    <Link to={setParametersPath(props.path, {id})}>{contractorNumber}</Link>
                )
            })
        },
        {
            title: 'Document Type',
            dataIndex: 'documentType',
            sorter: (a, b) => (a.documentType|| '').localeCompare(b.documentType || ''),
        },
        {
            title: 'Contractor Name',
            dataIndex: 'contractorName',
            sorter: (a, b) => (a.contractorName|| '').localeCompare(b.contractorName || ''),
        },
        {
            title: 'Valid From',
            dataIndex: 'validFrom',
            sorter: (a, b) => (a.validFrom?.getTime() || 0) - (b.validFrom?.getTime() || 0),
            render: (_, {validFrom}) => {
                return validFrom ? new Date(validFrom).toLocaleDateString() : '-';
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (_, { status }) => {
                let color;
                if (status === 'ACCEPTED') color = 'green';
                else if (status === 'REFUSED') color = 'volcano';
                else color = 'orange'
                return (
                    <Tag color={color} key={status}>
                        {status?.toUpperCase()}
                    </Tag>
                );
            }
        }
    ];

    const onChange: TableProps<TradeType>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const loadData = async () => {
        const data = await props.getData();
        const rows: TradeType[] = data.length > 0 ? data.map(r => {
            return {
                ...r,
                key: r.id
            } as TradeType
        }): [];
        setTableRows(rows);
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <Table columns={columns} dataSource={tableRows} onChange={onChange} />
    );
}
