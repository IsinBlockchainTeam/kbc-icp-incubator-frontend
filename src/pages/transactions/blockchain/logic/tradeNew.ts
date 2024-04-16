import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {TradeLinePresentable, TradeLinePrice} from "../../../../api/types/TradeLinePresentable";
import {MaterialPresentable} from "../../../../api/types/MaterialPresentable";
import {NotificationType, openNotification} from "../../../../utils/notification";
import dayjs from "dayjs";
import useTradeShared from "./tradeShared";
import {MenuProps} from "antd";
import {
    ICPResourceSpec,
    ICPStorageDriver
} from "@blockchain-lib/common";

export default function useTradeNew() {
    const {type, updateType, tradeService, orderState, elements} = useTradeShared();

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
        for (const key in values) {
            let id: string;
            if (key.startsWith('product-category-id-')) {
                id = key.split('-')[3];
                if (type === TradeType.BASIC)
                    (values['lines'] ||= []).push(new TradeLinePresentable(0, new MaterialPresentable(parseInt(values[key]))));
                else {
                    const materialId: number = parseInt(values[`product-category-id-${id}`]);
                    const quantity: number = parseInt(values[`quantity-${id}`]);
                    const price: number = parseInt(values[`price-${id}`].split(' ')[0]);
                    const fiat: string = values[`price-${id}`].split(' ')[1];
                    const line: TradeLinePresentable = new TradeLinePresentable(0, new MaterialPresentable(materialId), quantity, new TradeLinePrice(price, fiat));
                    (values['lines'] ||= []).push(line);
                }
            }
        }
        if (type === TradeType.BASIC) {
            await tradeService.saveBasicTrade(values);
            openNotification("Basic trade registered", `Basic trade "${values.name}" has been registered correctly!`, NotificationType.SUCCESS, 1);
        } else {
            values['paymentDeadline'] = dayjs(values['payment-deadline']).toDate();
            values['documentDeliveryDeadline'] = dayjs(values['document-delivery-deadline']).toDate();
            values['shippingDeadline'] = dayjs(values['shipping-deadline']).toDate();
            values['deliveryDeadline'] = dayjs(values['delivery-deadline']).toDate();
            await tradeService.saveOrderTrade(values);

            console.log("VALUES", values)
            console.log("PAYMENT INVOICE", values['payment-invoice']);
            const paymentInvoice = values['payment-invoice'] as unknown as File;
            const resourceSpec: ICPResourceSpec = {
                name: paymentInvoice.name,
                type: paymentInvoice.type,
                organizationId: 0
            }
            const storageDriver = ICPStorageDriver.getInstance();
            const blob = values['payment-invoice'] as unknown as Blob;
            console.log("BLOB:", blob);
            // Read the file
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            const content = (await new Promise((resolve) => {
                reader.onload = () => {
                    resolve(reader.result as ArrayBuffer);
                };
            })) as ArrayBuffer;
            const bytes = new Uint8Array(content);
            console.log("BYTES:", bytes);
            await storageDriver.create(bytes, resourceSpec);

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