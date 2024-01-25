import React, {useEffect, useState} from "react";
import {TableCertificationPresentable} from "@unece/cotton-fetch";
import {NotificationType, openNotification} from "../../../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {Link} from "react-router-dom";
import {setParametersPath} from "../../../../utils/utils";
import {paths} from "../../../../constants";
import {Table, TableProps, Tag} from "antd";
import {CardPage} from "../../../../components/structure/CardPage/CardPage";
import {CertificationService} from "../../../../api/services/CertificationService";
import {LegacyCertificationStrategy} from "../../../../api/strategies/certification/LegacyCertificationStrategy";

export const LegacyCertifications = () => {
    const [certifications, setCertifications] = useState<TableCertificationPresentable[]>();
    const loadData = async () => {
        try {
            const certificationService = new CertificationService(new LegacyCertificationStrategy());
            const certifications = await certificationService.getCertifications() as TableCertificationPresentable[];
            setCertifications(certifications.map(t => {
                // @ts-ignore
                t['key'] = t.id;
                return t;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<TableCertificationPresentable> = [
        {
            title: 'Ref. Number',
            dataIndex: 'certificateReferenceNumber',
            sorter: (a, b) => (a.certificateReferenceNumber || '').localeCompare((b.certificateReferenceNumber || '')),
            sortDirections: ['descend'],
            render: ((certificateReferenceNumber, {id, subject}) => {
                return (
                    <Link to={setParametersPath(paths.CERTIFICATION_VIEW, {id, type: subject?.toLowerCase()})}>{certificateReferenceNumber}</Link>
                )
            })
        },
        {
            title: 'Document Type',
            dataIndex: 'documentType',
        },
        {
            title: 'Assessment Level',
            dataIndex: 'assessmentType',
        },
        {
            title: 'Assessment Standard',
            dataIndex: 'referencedStandard',
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
            title: 'Valid Until',
            dataIndex: 'validUntil',
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

    const onChange: TableProps<TableCertificationPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Transformations">
            <Table columns={columns} dataSource={certifications} onChange={onChange}/>
        </CardPage>
    )
}

export default LegacyCertifications;
