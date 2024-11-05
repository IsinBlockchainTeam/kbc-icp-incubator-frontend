import { CardPage } from '@/components/structure/CardPage/CardPage';
import React, { useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Table } from 'antd';
import { InviteCompany } from './InviteCompany';
import { Relationship } from '@kbc-lib/coffee-trading-management-lib';

export const Partners = () => {
    // TODO: Retrieve it from icp
    const relationships: Relationship[] = [];
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const columns: ColumnsType<Relationship> = [
        {
            title: 'Company 1',
            dataIndex: 'companyA',
            sorter: (a, b) => a.companyA.localeCompare(b.companyA),
            sortDirections: ['descend']
        },
        {
            title: 'Company 2',
            dataIndex: 'companyB',
            sorter: (a, b) => a.companyB.localeCompare(b.companyB),
            sortDirections: ['descend']
        },
        {
            title: 'Valid From',
            dataIndex: 'validFrom',
            render: (_, { validFrom }) => {
                return validFrom ? new Date(validFrom).toLocaleDateString() : 'No date';
            }
        },
        {
            title: 'Valid Until',
            dataIndex: 'validUntil',
            render: (_, { validUntil }) => {
                return validUntil ? new Date(validUntil).toLocaleDateString() : 'No date';
            }
        }
    ];

    return (
        <>
            <InviteCompany open={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CardPage
                title="Partners"
                extra={<a onClick={() => setIsModalOpen(true)}>Invite a new company</a>}>
                <Table columns={columns} dataSource={relationships} rowKey={'id'} />
            </CardPage>
        </>
    );
};

export default Partners;
