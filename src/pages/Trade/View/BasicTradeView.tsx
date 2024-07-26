import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { BasicTrade, LineRequest } from '@kbc-lib/coffee-trading-management-lib';
import { Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import React from 'react';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { BasicTradeRequest, useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';
import { useEthOrderTrade } from '@/providers/entities/EthOrderTradeProvider';

type BasicTradeViewProps = {
    basicTrade: BasicTrade;
    disabled: boolean;
    toggleDisabled: () => void;
    commonElements: FormElement[];
};
export const BasicTradeView = ({
    basicTrade,
    disabled,
    toggleDisabled,
    commonElements
}: BasicTradeViewProps) => {
    const { productCategories } = useEthMaterial();
    const { units } = useEthEnumerable();
    const { updateBasicTrade } = useEthBasicTrade();
    const { confirmNegotiation } = useEthOrderTrade();
    const navigate = useNavigate();
    const documentHeight = '45vh';

    const onSubmit = async (values: any) => {
        const quantity: number = parseInt(values[`quantity-1`]);
        const unit: string = values[`unit-1`];
        const productCategoryId: number = parseInt(values['product-category-id-1']);

        const updatedBasicTrade: BasicTradeRequest = {
            supplier: values['supplier'],
            customer: values['customer'],
            commissioner: values['commissioner'],
            lines: [new LineRequest(productCategoryId, quantity, unit)],
            name: values['name']
        };
        await updateBasicTrade(basicTrade.tradeId, updatedBasicTrade);

        toggleDisabled();
        navigate(paths.TRADES);
    };

    const elements: FormElement[] = [
        ...commonElements,
        { type: FormElementType.TITLE, span: 24, label: 'Data' },
        {
            type: FormElementType.INPUT,
            span: 12,
            name: 'name',
            label: 'Name',
            required: true,
            defaultValue: basicTrade.name,
            disabled
        },
        {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: 'certificate-of-shipping',
            label: 'Certificate of Shipping',
            required: false,
            loading: false,
            uploadable: !disabled,
            // TODO: Fix this
            // info: getBasicTradeDocuments(basicTrade.tradeId),
            height: documentHeight
        },
        { type: FormElementType.TITLE, span: 24, label: 'Line Item' }
    ];
    basicTrade.lines.forEach((line, index) => {
        elements.push(
            {
                type: FormElementType.SELECT,
                span: 8,
                name: `product-category-id-${index + 1}`,
                label: 'Product Category Id',
                required: true,
                options: productCategories.map((productCategory) => ({
                    label: productCategory.name,
                    value: productCategory.id
                })),
                defaultValue:
                    productCategories.find((pc) => pc.id === line.productCategory?.id)?.id || -1,
                disabled
            },
            {
                type: FormElementType.INPUT,
                span: 6,
                name: `quantity-${index + 1}`,
                label: 'Quantity',
                required: true,
                defaultValue: line.quantity?.toString(),
                disabled
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `unit-${index + 1}`,
                label: 'Unit',
                required: true,
                options: units.map((unit) => ({ label: unit, value: unit })),
                defaultValue: line.unit!,
                disabled
            },
            { type: FormElementType.SPACE, span: 6 }
        );
    });
    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Basic
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <EditOutlined style={{ marginLeft: '8px' }} onClick={toggleDisabled} />
                            <Tooltip title="Confirm the negotiation if everything is OK">
                                <CheckCircleOutlined
                                    role="confirm"
                                    style={{ marginLeft: '8px' }}
                                    onClick={() => confirmNegotiation(basicTrade.tradeId)}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            }>
            <GenericForm
                elements={elements}
                confirmText="Are you sure you want to proceed?"
                submittable={!disabled}
                onSubmit={onSubmit}
            />
        </CardPage>
    );
};
