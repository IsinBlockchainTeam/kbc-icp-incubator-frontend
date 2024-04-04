import {DocumentType, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable, TradeLinePrice} from "../../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../../api/types/MaterialPresentable";
import {NotificationType, openNotification} from "../../../../utils/notification";
import dayjs from "dayjs";
import useTradeShared from "./tradeShared";
import {MenuProps} from "antd";
import {DocumentPresentable} from "../../../../api/types/DocumentPresentable";
import {TradePresentable} from "../../../../api/types/TradePresentable";

export default function useTradeNew() {
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
        console.log("values: ", values)
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
            console.log("values['payment-invoice']: ", values['payment-invoice'])
            console.log("values['payment-invoice'] || lala: ", values['swiss-decode'] && 'lala')
            console.log("values['payment-invoice'].type: ", values['payment-invoice'].type)
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
                )
                .setSwissDecode(values['swiss-decode'] && new DocumentPresentable()
                    .setContentType(values['swiss-decode'].type)
                    .setDocumentType(DocumentType.SWISS_DECODE)
                    .setFilename(values['swiss-decode'].name)
                    .setContent(values['swiss-decode'])
                )
                .setDeliveryNote(values['certificate-of-shipping'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-shipping'].type)
                    .setDocumentType(DocumentType.DELIVERY_NOTE)
                    .setFilename(values['certificate-of-shipping'].name)
                    .setContent(values['certificate-of-shipping'])
                )
                .setBillOfLading(values['bill-of-lading'] && new DocumentPresentable()
                    .setContentType(values['bill-of-lading'].type)
                    .setDocumentType(DocumentType.BILL_OF_LADING)
                    .setFilename(values['bill-of-lading'].name)
                    .setContent(values['bill-of-lading'])
                )
                .setWeightCertificate(values['certificate-of-weight'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-weight'].type)
                    .setDocumentType(DocumentType.WEIGHT_CERTIFICATE)
                    .setFilename(values['certificate-of-weight'].name)
                    .setContent(values['certificate-of-weight'])
                )
                .setPreferentialEntryCertificate(values['certificate-of-preferential-entry'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-preferential-entry'].type)
                    .setDocumentType(DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE)
                    .setFilename(values['certificate-of-preferential-entry'].name)
                    .setContent(values['certificate-of-preferential-entry'])
                )
                .setFumigationCertificate(values['certificate-of-fumigation'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-fumigation'].type)
                    .setDocumentType(DocumentType.FUMIGATION_CERTIFICATE)
                    .setFilename(values['certificate-of-fumigation'].name)
                    .setContent(values['certificate-of-fumigation'])
                )
                .setPhytosanitaryCertificate(values['certificate-of-phytosanitary'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-phytosanitary'].type)
                    .setDocumentType(DocumentType.PHYTOSANITARY_CERTIFICATE)
                    .setFilename(values['certificate-of-phytosanitary'].name)
                    .setContent(values['certificate-of-phytosanitary'])
                )
                .setInsuranceCertificate(values['certificate-of-insurance'] && new DocumentPresentable()
                    .setContentType(values['certificate-of-insurance'].type)
                    .setDocumentType(DocumentType.INSURANCE_CERTIFICATE)
                    .setFilename(values['certificate-of-insurance'].name)
                    .setContent(values['certificate-of-insurance'])
                );
            await tradeService.saveOrderTrade(trade);
            openNotification("Order trade registered", `Order trade has been registered correctly!`, NotificationType.SUCCESS, 1);
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
