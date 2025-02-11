import React from "react";
import { capitalizeFirstLetter } from "@/utils/format";
import { ICPBaseCertificate } from "@kbc-lib/coffee-trading-management-lib";
import { Space, Tooltip, Badge } from "antd";
import { useState } from "react";
import { CertificationsModalProps, CertificationsModal } from "./CertificationsModal";

type CertGroupProps = {
    certType: 'company' | 'scope' | 'material',
    certs: ICPBaseCertificate[],
    icon: React.ReactNode,
    color: string
};

export const CertificationBadge = (props: CertGroupProps) => {
    const { certType, certs, icon, color } = props;
    const [modalProps, setModalProps] = useState<CertificationsModalProps>({ open: false, title: '', certifications: [], onClose: () => { } });

    if (!certs || certs.length === 0) return null;

    const showCertificationsModal = (title: string, certifications: ICPBaseCertificate[]) => {
        setModalProps({
            open: true,
            title,
            certifications,
            onClose: () => setModalProps({ open: false, title: '', certifications: [], onClose: () => { } })
        });
    };


    return (
        <>
            <CertificationsModal
                open={modalProps.open}
                title={modalProps.title}
                certifications={modalProps.certifications}
                onClose={modalProps.onClose}
            />
            <Space>
                <Space size={4}>
                    <Tooltip title={`${capitalizeFirstLetter(certType)} Certifications`}>{icon}</Tooltip>
                    <Tooltip title={certs.map((c) => c.assessmentReferenceStandard.name).join(', ')}>
                        <Badge
                            count={certs.length}
                            style={{ backgroundColor: color, cursor: 'pointer' }}
                            onClick={() => showCertificationsModal(`${capitalizeFirstLetter(certType)} Certifications`, certs)}
                        />
                    </Tooltip>
                </Space>
            </Space>
        </>

    );
}