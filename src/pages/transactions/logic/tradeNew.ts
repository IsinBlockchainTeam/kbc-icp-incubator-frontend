import {DocumentType, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable, TradeLinePrice} from "../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../api/types/MaterialPresentable";
import {NotificationType, openNotification} from "../../../utils/notification";
import dayjs from "dayjs";
import useTradeShared from "./tradeShared";
import {MenuProps} from "antd";
import {DocumentPresentable} from "../../../api/types/DocumentPresentable";
import {TradePresentable} from "../../../api/types/TradePresentable";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {useNavigate} from "react-router-dom";
import {paths} from "../../../constants";

export default function useTradeNew() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { type, updateType, tradeService, orderState, elements } = useTradeShared();

    const items: MenuProps['items'] = [
        {label: 'BASIC', key: '0'},
        {label: 'ORDER', key: '1'},
    ];

    const menuProps = {
        items,
        onClick: ({key}: any) => {
            updateType(parseInt(key) as TradeType);
        }
    }

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Creating trade..."));
            const trade: TradePresentable = new TradePresentable()
                .setSupplier(values['supplier'])
                .setCustomer(values['customer'])
                .setCommissioner(values['commissioner']);
            const tradeLines: TradeLinePresentable[] = [];
            for (const key in values) {
                let id: string;
                if (key.startsWith('product-category-id-')) {
                    id = key.split('-')[3];
                    if(type === TradeType.BASIC)
                        tradeLines.push(new TradeLinePresentable(0, new MaterialPresentable(parseInt(values[key]))));
                    else {
                        const materialId: number = parseInt(values[`product-category-id-${id}`]);
                        const quantity: number = parseInt(values[`quantity-${id}`]);
                        const price: number = parseInt(values[`price-${id}`].split(' ')[0]);
                        const fiat: string = values[`price-${id}`].split(' ')[1];
                        tradeLines.push(new TradeLinePresentable(0, new MaterialPresentable(materialId), quantity, new TradeLinePrice(price, fiat)))
                    }
                }
            }
            trade.setLines(tradeLines);
            if (type === TradeType.BASIC) {
                await tradeService.saveBasicTrade(values);
                openNotification("Basic trade registered", `Basic trade "${values.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            } else {
                trade
                    .setIncoterms(values['incoterms'])
                    .setPaymentDeadline(dayjs(values['payment-deadline']).toDate())
                    .setDocumentDeliveryDeadline(dayjs(values['document-delivery-deadline']).toDate())
                    .setShippingDeadline(dayjs(values['shipping-deadline']).toDate())
                    .setDeliveryDeadline(dayjs(values['delivery-deadline']).toDate())
                    .setShipper(values['shipper'])
                    .setArbiter(values['arbiter'])
                    .setShippingPort(values['shipping-port'])
                    .setDeliveryPort(values['delivery-port'])
                    .setAgreedAmount(parseInt(values['agreed-amount']))
                    .setTokenAddress(values['token-address'])
                    .setPaymentInvoice(values['payment-invoice'] && new DocumentPresentable()
                        .setContentType(values['payment-invoice'].type)
                        .setDocumentType(DocumentType.PAYMENT_INVOICE)
                        .setFilename(values['payment-invoice'].name)
                        .setContent(values['payment-invoice'])
                    );
                await tradeService.saveOrderTrade(trade);
                openNotification("Order trade registered", `Order trade has been registered correctly!`, NotificationType.SUCCESS, 1);
                navigate(paths.TRADES);
            }
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
