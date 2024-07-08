import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { regex } from '@/utils/regex';
import { LineRequest, DocumentType } from '@kbc-lib/coffee-trading-management-lib';
import { BasicTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { useEthMaterial } from '@/providers/entities/EthMaterialProvider';
import { useEthEnumerable } from '@/providers/entities/EthEnumerableProvider';
import { useEthBasicTrade } from '@/providers/entities/EthBasicTradeProvider';

type BasicTradeNewProps = {
    supplierAddress: string;
    customerAddress: string;
    productCategoryId: number;
    commonElements: FormElement[];
};
export const BasicTradeNew = ({
    supplierAddress,
    customerAddress,
    productCategoryId,
    commonElements
}: BasicTradeNewProps) => {
    const { saveBasicTrade } = useEthBasicTrade();
    const { productCategories } = useEthMaterial();
    const { units } = useEthEnumerable();

    const navigate = useNavigate();
    const location = useLocation();
    const documentHeight = '45vh';

    const onSubmit = async (values: any) => {
        //FIXME: This is a workaround to get data instead of the form
        values['supplier'] = supplierAddress;
        values['customer'] = customerAddress;
        values['commissioner'] = customerAddress;
        values['product-category-id-1'] = productCategoryId;

        const tradeLines: LineRequest[] = [];
        for (const key in values) {
            let id: string;
            if (key.startsWith('product-category-id-')) {
                id = key.split('-')[3];
                const quantity: number = parseInt(values[`quantity-${id}`]);
                const unit: string = values[`unit-${id}`];
                const productCategoryId: number = parseInt(values[key]);
                tradeLines.push(new LineRequest(productCategoryId, quantity, unit));
            }
        }
        const basicTrade: BasicTradeRequest = {
            supplier: supplierAddress,
            customer: customerAddress,
            commissioner: customerAddress,
            lines: tradeLines as LineRequest[],
            name: values['name']
        };
        const deliveryNote: DocumentRequest = {
            content: values['certificate-of-shipping'],
            filename: values['certificate-of-shipping'].name,
            documentType: DocumentType.DELIVERY_NOTE
        };
        await saveBasicTrade(basicTrade, [deliveryNote]);
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
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.DOCUMENT,
            span: 12,
            name: 'certificate-of-shipping',
            label: 'Shipping Invoice',
            required: true,
            loading: false,
            uploadable: true,
            height: documentHeight,
            approvable: false
        },
        { type: FormElementType.TITLE, span: 24, label: 'Line Item' },
        {
            type: FormElementType.SELECT,
            span: 8,
            name: 'product-category-id-1',
            label: 'Product Category',
            required: false,
            options: productCategories.map((productCategory) => ({
                label: productCategory.name,
                value: productCategory.id
            })),
            defaultValue:
                productCategories.find((pc) => pc.id === location?.state?.productCategoryId)?.id ||
                -1,
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 6,
            name: `quantity-1`,
            label: 'Quantity',
            required: true,
            regex: regex.ONLY_DIGITS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.SELECT,
            span: 4,
            name: `unit-1`,
            label: 'Unit',
            required: true,
            options: units.map((unit) => ({ label: unit, value: unit })),
            defaultValue: '',
            disabled: false
        },
        { type: FormElementType.SPACE, span: 6 }
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
                    New Trade
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.TRADES)}>
                        Delete Trade
                    </Button>
                </div>
            }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
        </CardPage>
    );
};
