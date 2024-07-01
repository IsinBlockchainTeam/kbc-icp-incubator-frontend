import { FormElement, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';

type Props = {
    elements: FormElement[];
    submittable: boolean;
    onSubmit: (values: any) => void;
};
export const ContractStipulation = ({ elements, submittable, onSubmit }: Props) => {
    return <GenericForm elements={elements} submittable={submittable} onSubmit={onSubmit} />;
};
