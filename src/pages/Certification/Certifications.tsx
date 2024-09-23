import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { Table, Tag } from 'antd';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { PlusOutlined } from '@ant-design/icons';
import { BaseCertificate, CertificateType } from '@kbc-lib/coffee-trading-management-lib';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';

export const Certifications = () => {
    const navigate = useNavigate();
    const { rawCertificates } = useEthRawCertificate();
    const { getCompany } = useICPOrganization();
    console.log('rawCertificates', rawCertificates);
    const columns: ColumnsType<BaseCertificate> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id, { certificateType }) => (
                <Link
                    to={setParametersPath(`${paths.CERTIFICATION_VIEW}`, {
                        id,
                        type: certificateType.toString()
                    })}>
                    {id}
                </Link>
            )
        },
        {
            title: 'Assessment Standard',
            dataIndex: 'assessmentStandard',
            sorter: (a, b) => a.assessmentStandard.localeCompare(b.assessmentStandard)
        },
        {
            title: 'Certifier',
            dataIndex: 'issuer',
            render: (_, { issuer }) => getCompany(issuer).legalName,
            sorter: (a, b) =>
                getCompany(a.issuer).legalName.localeCompare(getCompany(b.issuer).legalName)
        },
        {
            title: 'Issue date',
            dataIndex: 'issueDate',
            render: (issueDate) => new Date(issueDate).toLocaleDateString(),
            sorter: (a, b) => a.issueDate - b.issueDate
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (_, { certificateType }) => (
                <Tag color="geekblue">{CertificateType[certificateType]}</Tag>
            ),
            sorter: (a, b) =>
                CertificateType[a.certificateType]
                    .toLowerCase()
                    .localeCompare(CertificateType[b.certificateType].toLowerCase())
        }
    ];

    const newCertificationsType = [
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.COMPANY.toString()
            }),
            label: 'Company Certification'
        },
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.SCOPE.toString()
            }),
            label: 'Scope Certification'
        },
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.MATERIAL.toString()
            }),
            label: 'Material Certification'
        }
    ];

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Certifications
                    <div>
                        <DropdownButton
                            trigger={['hover']}
                            type="primary"
                            menu={{ items: newCertificationsType, onClick: (e) => navigate(e.key) }}
                            icon={<PlusOutlined />}>
                            New Certification
                        </DropdownButton>
                    </div>
                </div>
            }>
            <Table columns={columns} dataSource={rawCertificates} />
        </CardPage>
    );
};
