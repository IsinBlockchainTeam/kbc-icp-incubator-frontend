import {
    DocumentType,
    TradeType,
    LineRequest,
    OrderLineRequest,
    OrderLinePrice
} from '@kbc-lib/coffee-trading-management-lib';
import { NotificationType, openNotification } from '@/utils/notification';
import dayjs from 'dayjs';
import useTradeShared from './tradeShared';
import { MenuProps } from 'antd';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/constants/index';
import { BasicTradeRequest, OrderTradeRequest } from '@/api/types/TradeRequest';
import { DocumentRequest } from '@/api/types/DocumentRequest';
import { useContext } from 'react';
import { SignerContext } from '@/providers/SignerProvider';

export default function useTradeNew() {
    const { signer } = useContext(SignerContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { type, updateType, ethTradeService, elements } = useTradeShared();

    const items: MenuProps['items'] = [
        { label: 'BASIC', key: '0' },
        { label: 'ORDER', key: '1' }
    ];

    const menuProps = {
        items,
        onClick: ({ key }: any) => {
            updateType(parseInt(key) as TradeType);
        }
    };

    const onSubmit = async (values: any) => {
        try {
            //FIXME: This is a workaround to get data instead of the form
            values['supplier'] = location?.state?.supplierAddress || 'Unknown';
            values['customer'] = signer?.address || 'Unknown';
            values['commissioner'] = signer?.address || 'Unknown';
            values['product-category-id-1'] = location?.state?.productCategoryId || '0';
            dispatch(showLoading('Creating trade...'));
            const supplier: string = values['supplier'];
            const customer: string = values['customer'];
            const commissioner: string = values['commissioner'];

            const tradeLines: LineRequest[] = [];
            for (const key in values) {
                let id: string;
                if (key.startsWith('product-category-id-')) {
                    id = key.split('-')[3];
                    const quantity: number = parseInt(values[`quantity-${id}`]);
                    const unit: string = values[`unit-${id}`];
                    const productCategoryId: number = parseInt(values[key]);

                    if (type === TradeType.BASIC) {
                        tradeLines.push(new LineRequest(productCategoryId, quantity, unit));
                    } else {
                        const price: number = parseInt(values[`price-${id}`]);
                        const fiat: string = values[`fiat-${id}`];
                        tradeLines.push(
                            new OrderLineRequest(
                                productCategoryId,
                                quantity,
                                unit,
                                new OrderLinePrice(price, fiat)
                            )
                        );
                    }
                }
            }
            if (type === TradeType.BASIC) {
                const basicTrade: BasicTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: tradeLines as LineRequest[],
                    name: values['name']
                };
                const deliveryNote: DocumentRequest = {
                    content: values['certificate-of-shipping'],
                    filename: values['certificate-of-shipping'].name,
                    documentType: DocumentType.DELIVERY_NOTE
                };
                await ethTradeService.saveBasicTrade(basicTrade, [deliveryNote]);
                openNotification(
                    'Basic trade registered',
                    `Basic trade "${values.name}" has been registered correctly!`,
                    NotificationType.SUCCESS,
                    1
                );
            } else {
                const orderTrade: OrderTradeRequest = {
                    supplier,
                    customer,
                    commissioner,
                    lines: tradeLines as OrderLineRequest[],
                    paymentDeadline: dayjs(values['payment-deadline']).unix(),
                    documentDeliveryDeadline: dayjs(values['document-delivery-deadline']).unix(),
                    arbiter: values['arbiter'],
                    shippingDeadline: dayjs(values['shipping-deadline']).unix(),
                    deliveryDeadline: dayjs(values['delivery-deadline']).unix(),
                    agreedAmount: parseInt(values['agreed-amount']),
                    tokenAddress: values['token-address'],
                    incoterms: values['incoterms'],
                    shipper: values['shipper'],
                    shippingPort: values['shipping-port'],
                    deliveryPort: values['delivery-port']
                };
                await ethTradeService.saveOrderTrade(orderTrade);
                openNotification(
                    'Order trade registered',
                    `Order trade has been registered correctly!`,
                    NotificationType.SUCCESS,
                    1
                );
            }
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log('error: ', e);
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    return {
        type,
        elements,
        menuProps,
        onSubmit
    };
}
