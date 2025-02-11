import React from 'react';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { regex } from '@/constants/regex';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { CardPage } from '@/components/CardPage/CardPage';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/constants/paths';

export const PartnerInvite = () => {
    const { inviteOrganization } = useOrganization();
    const navigate = useNavigate();

    const onSubmit = async (values: any) => {
        await inviteOrganization(values.email, values.name);
        navigate(paths.PARTNERS);
    };

    const elements: FormElement[] = [
        { type: FormElementType.TITLE, span: 24, label: 'Details' },
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'email',
            label: 'Organization email',
            required: true,
            defaultValue: '',
            regex: regex.EMAIL
        },
        {
            type: FormElementType.INPUT,
            span: 24,
            name: 'name',
            label: 'Organization name',
            required: true,
            defaultValue: ''
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
                    Invite Partner
                </div>
            }>
            <GenericForm elements={elements} confirmText="Are you sure you want to invite this company?" submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};
export default PartnerInvite;
