import React from 'react';
import { CardPage } from '@/components/CardPage/CardPage';
import { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ICPBaseCertificate, ICPCertificateType } from '@kbc-lib/coffee-trading-management-lib';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { useRawCertification } from '@/providers/entities/icp/RawCertificationProvider';
import { InfoCard } from '@/components/InfoCard/InfoCard';

const { Text } = Typography;

export const certificationsType = [
    {
        key: setParametersPath(paths.CERTIFICATION_NEW, {
            type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.COMPANY).toString()
        }),
        label: 'Company Certification'
    },
    {
        key: setParametersPath(paths.CERTIFICATION_NEW, {
            type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.SCOPE).toString()
        }),
        label: 'Scope Certification'
    },
    {
        key: setParametersPath(paths.CERTIFICATION_NEW, {
            type: Object.keys(ICPCertificateType).indexOf(ICPCertificateType.MATERIAL).toString()
        }),
        label: 'Material Certification'
    }
];

export const Certifications = () => {
    const navigate = useNavigate();
    const { rawCertificates } = useRawCertification();

    const certificationInfo = {
        title: 'Certification Types & Standards',
        items: [
            <Text>
                This page displays all certifications that your company have received.
            </Text>,
            <>
                <Text strong>
                    {'Certification Categories: '}
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>
                        <Text strong>Company: </Text>
                        <Text>Validates organizational compliance and standards.</Text>
                    </li>
                    <li>
                        <Text strong>Scope: </Text>
                        <Text>Defines the range of certified activities.</Text>
                    </li>
                    <li>
                        <Text strong>Material: </Text>
                        <Text>Ensures product quality and authenticity.</Text>
                    </li>
                </ul>
            </>,
        ],
        marginTop: '0px',
        collapsed: true,
        image: './assets/business-certificate.png'
    };

    const columns: ColumnsType<ICPBaseCertificate> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],
            render: (id, { certificateType }) => (
                <Link
                    to={setParametersPath(`${paths.CERTIFICATION_VIEW}`, {
                        id,
                        type: Object.keys(ICPCertificateType).indexOf(certificateType).toString()
                    })}>
                    {id}
                </Link>
            )
        },
        {
            title: 'Assessment Reference Standard',
            dataIndex: 'assessmentReferenceStandard',
            render: (_, { assessmentReferenceStandard }) => assessmentReferenceStandard.name,
            sorter: (a, b) => a.assessmentReferenceStandard.name.localeCompare(b.assessmentReferenceStandard.name)
        },
        {
            title: 'Certifier',
            dataIndex: 'issuer',
            render: (_, { issuer }) => issuer,
            sorter: (a, b) => a.issuer.localeCompare(b.issuer)
        },
        {
            title: 'Issue date',
            dataIndex: 'issueDate',
            render: (issueDate) => issueDate.toLocaleDateString(),
            sorter: (a, b) => a.issueDate.getTime() - b.issueDate.getTime()
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (_, { certificateType }) => <Tag color="geekblue">{ICPCertificateType[certificateType]}</Tag>,
            sorter: (a, b) => ICPCertificateType[a.certificateType].toLowerCase().localeCompare(ICPCertificateType[b.certificateType].toLowerCase())
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
                            menu={{ items: certificationsType, onClick: (e) => navigate(e.key) }}
                            icon={<PlusOutlined />}>
                            New Certification
                        </DropdownButton>
                    </div>
                </div>
            }>
            <InfoCard {...certificationInfo} />
            <Table columns={columns} dataSource={rawCertificates} />
        </CardPage>
    );
};
