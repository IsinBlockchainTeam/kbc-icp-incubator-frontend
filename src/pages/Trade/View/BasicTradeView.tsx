import { BasicTradePresentable } from '@/api/types/TradePresentable';
import { FormElement, FormElementType, GenericForm } from '@/components/GenericForm/GenericForm';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { BasicTrade, DocumentType, LineRequest } from '@kbc-lib/coffee-trading-management-lib';
import { Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import React, { useContext, useEffect } from 'react';
import useMaterial from '@/hooks/useMaterial';
import useMeasure from '@/hooks/useMeasure';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { BasicTradeRequest } from '@/api/types/TradeRequest';
import { paths } from '@/constants/paths';
import { useNavigate } from 'react-router-dom';
import { EthContext } from '@/providers/EthProvider';
import { useDispatch } from 'react-redux';

type BasicTradeViewProps = {
    basicTradePresentable: BasicTradePresentable;
    disabled: boolean;
    toggleDisabled: () => void;
    confirmNegotiation: () => void;
    commonElements: FormElement[];
};
export const BasicTradeView = ({
    basicTradePresentable,
    disabled,
    toggleDisabled,
    confirmNegotiation,
    commonElements
}: BasicTradeViewProps) => {
    const { ethTradeService } = useContext(EthContext);
    const { loadData, dataLoaded, productCategories } = useMaterial();
    const { units } = useMeasure();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const documentHeight = '45vh';
    const basicTrade = basicTradePresentable.trade as BasicTrade;

    useEffect(() => {
        if (!dataLoaded) loadData();
    }, [dataLoaded]);

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading('Loading...'));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification(
                    'Delivery deadline cannot be less then shipping one',
                    '',
                    NotificationType.ERROR
                );
            } else {
                const supplier: string = values['supplier'];
                const customer: string = values['customer'];
                const commissioner: string = values['commissioner'];
                const quantity: number = parseInt(values[`quantity-1`]);
                const unit: string = values[`unit-1`];
                const productCategoryId: number = parseInt(values['product-category-id-1']);

                const updatedBasicTrade: BasicTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: [new LineRequest(productCategoryId, quantity, unit)],
                    name: values['name']
                };
                await ethTradeService.putBasicTrade(basicTrade.tradeId, updatedBasicTrade);

                toggleDisabled();
                navigate(paths.TRADES);
            }
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    if (!dataLoaded) return <></>;

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
            info: basicTradePresentable.documents.get(DocumentType.DELIVERY_NOTE),
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
                                    style={{ marginLeft: '8px' }}
                                    onClick={confirmNegotiation}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            }>
            <GenericForm elements={elements} submittable={!disabled} onSubmit={onSubmit} />
        </CardPage>
    );
};
