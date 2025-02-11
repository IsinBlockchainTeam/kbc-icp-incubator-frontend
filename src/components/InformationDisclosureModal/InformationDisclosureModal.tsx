import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Organization } from '@kbc-lib/coffee-trading-management-lib';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';
import { useBusinessRelation } from '@/providers/entities/icp/BusinessRelationProvider';

interface InformationDisclosureModalProps {
    otherOrganization: Organization;
}

export const InformationDisclosureModal = ({ otherOrganization }: InformationDisclosureModalProps) => {
    const navigate = useNavigate();
    const { discloseInformation, getBusinessRelation } = useBusinessRelation();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        tryToGetBusinessRelation();
    }, [otherOrganization]);

    const tryToGetBusinessRelation = () => {
        try {
            getBusinessRelation(otherOrganization.ethAddress);
        } catch (error) {
            setIsVisible(true);
        }
    };

    const handleOk = () => {
        setIsVisible(false);
        discloseInformation(otherOrganization.ethAddress);
    };

    const handleCancel = () => {
        setIsVisible(false);
        navigate(paths.HOME);
    };

    return (
        <Modal
            title="Information Disclosure"
            open={isVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Yes, disclose"
            cancelText="No, go back">
            <p>The commissioner has requested visibility of your information. Would you like to disclose your information with the commissioner?</p>
        </Modal>
    );
};
