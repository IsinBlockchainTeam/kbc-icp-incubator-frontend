import {
    DocumentType,
    TradeType,
    Material,
    LineRequest,
    OrderLineRequest,
    OrderLinePrice, OrderTrade, NegotiationStatus, OrderTradeMetadata, Line
} from "@kbc-lib/coffee-trading-management-lib";
import {NotificationType, openNotification} from "../../../utils/notification";
import dayjs from "dayjs";
import useTradeShared from "./tradeShared";
import {MenuProps} from "antd";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {TradePreviewPresentable} from "../../../api/types/TradePresentable";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {useLocation, useNavigate} from "react-router-dom";
import {paths} from "../../../constants";
import SingletonSigner from "../../../api/SingletonSigner";
import {OrderTradeRequest} from "../../../api/types/TradeRequest";

export default function useTradeNew() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { type, updateType, tradeService, orderState, elements } = useTradeShared();

    const items: MenuProps['items'] = [
        {label: 'BASIC', key: '0'},
        {label: 'ORDER', key: '1'},
    ];

    const menuProps = {
        items,
        onClick: ({key}: any) => {
            updateType(parseInt(key) as TradeType);
        },
    }

    const onSubmit = async (values: any) => {
        try {
            //FIXME: This is a workaround to get data instead of the form
            values['supplier'] = location?.state?.supplierAddress || 'Unknown';
            values['customer'] = SingletonSigner.getInstance()?.address || 'Unknown';
            values['commissioner'] = SingletonSigner.getInstance()?.address || 'Unknown';
            values['product-category-id-1'] = location?.state?.productCategoryId || '0';
            dispatch(showLoading("Creating trade..."));
            // const tradeToSubmit: TradePreviewPresentable = new TradePreviewPresentable()
            //     .setSupplier(values['supplier'])
            //     .setCustomer(values['customer'])
            //     .setCommissioner(values['commissioner']);
            const supplier: string = values['supplier'];
            const customer: string = values['customer'];
            const commissioner: string = values['commissioner'];
            // TODO: fix this
            const tradeLines: LineRequest[] = [];
            for (const key in values) {
                let id: string;
                if (key.startsWith('product-category-id-')) {
                    id = key.split('-')[3];
                    const quantity: number = parseInt(values[`quantity-${id}`]);
                    const unit: string = values[`unit-${id}`];
                    const productCategoryId: number = parseInt(values[key]);

                    if (type === TradeType.BASIC)
                        tradeLines.push(new LineRequest(productCategoryId, quantity, unit));

                    else {
                        const price: number = parseInt(values[`price-${id}`].split(' ')[0]);
                        const fiat: string = values[`fiat-${id}`];
                        tradeLines.push(new OrderLineRequest(productCategoryId, quantity, unit, new OrderLinePrice(price, fiat)));
                    }
                }
            }
            // trade.setLines(tradeLines);
            if (type === TradeType.BASIC) {
                // TODO: Implement this
                // trade
                //     .setName(values['name'])
                //     .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                //         .setContentType(values['certificate-of-shipping'].type)
                //         .setDocumentType(DocumentType.DELIVERY_NOTE)
                //         .setFilename(values['certificate-of-shipping'].name)
                //         .setContent(values['certificate-of-shipping'])
                //     )
                // await tradeService.saveBasicTrade(trade);
                // openNotification("Basic trade registered", `Basic trade "${values.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            } else {
                // trade
                //     .setIncoterms(values['incoterms'])
                //     .setPaymentDeadline(dayjs(values['payment-deadline']).toDate())
                //     .setDocumentDeliveryDeadline(dayjs(values['document-delivery-deadline']).toDate())
                //     .setShippingDeadline(dayjs(values['shipping-deadline']).toDate())
                //     .setDeliveryDeadline(dayjs(values['delivery-deadline']).toDate())
                //     .setShipper(values['shipper'])
                //     .setArbiter(values['arbiter'])
                //     .setShippingPort(values['shipping-port'])
                //     .setDeliveryPort(values['delivery-port'])
                //     .setAgreedAmount(parseInt(values['agreed-amount']))
                //     .setTokenAddress(values['token-address'])
                //     .setPaymentInvoice(values['payment-invoice'] && new DocumentPresentable()
                //         .setContentType(values['payment-invoice'].type)
                //         .setDocumentType(DocumentType.PAYMENT_INVOICE)
                //         .setFilename(values['payment-invoice'].name)
                //         .setContent(values['payment-invoice'])
                //     );

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
                }
                await tradeService.saveOrderTrade(orderTrade);
                openNotification("Order trade registered", `Order trade has been registered correctly!`, NotificationType.SUCCESS, 1);
            }
            navigate(paths.TRADES);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    }

    return {
        type,
        orderState,
        elements,
        menuProps,
        onSubmit
    }
}
