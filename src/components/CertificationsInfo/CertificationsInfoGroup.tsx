import React, { useEffect, useState } from 'react';
import { Space } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { ICPCompanyCertificate } from '@kbc-lib/coffee-trading-management-lib';
import { useCertification } from '@/providers/entities/icp/CertificationProvider';
import { CertificationBadge } from './CertificationBadge';

type Props = {
    company: string;
    materialId: number;
};


export const CertificationsInfoGroup = (props: Props) => {
    const { company, materialId } = props;
    const { getCompanyCertificates } = useCertification();
    const [companyCertificates, setCompanyCertificates] = useState<ICPCompanyCertificate[]>([]);
    // const [scopeCertificates, setScopeCertificates] = useState<ICPScopeCertificate[]>([]);
    // const [materialCertificates, setMaterialCertificates] = useState<ICPMaterialCertificate[]>([]);

    const loadCertificates = async () => {
        setCompanyCertificates(await getCompanyCertificates(company));
    };

    useEffect(() => {
        loadCertificates();
    }, [company, materialId]);


    return (
        <>
            <Space wrap size={12}>
                <CertificationBadge certType="company" certs={companyCertificates} icon={<BankOutlined style={{ color: '#1890ff', fontSize: 24 }} />} color="#1890ff" />
                {/* <CertificationInfoGroup certType="material" certs={materialCertificates} icon={<GoldOutlined style={{ color: '#52c41a', fontSize: 24 }} />} color="#52c41a" /> */}
                {/* <CertificationInfoGroup certType="scope" certs={scopeCertificates} icon={<ExperimentOutlined style={{ color: '#ffa500', fontSize: 24 }} />} color="#ffa500" /> */}
            </Space>
        </>
    );
};
