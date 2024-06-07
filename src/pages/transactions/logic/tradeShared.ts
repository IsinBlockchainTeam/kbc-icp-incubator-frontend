import {useContext, useEffect, useState} from "react";
import {DocumentStatus, ProductCategory, TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {ElementStatus, FormElement, FormElementType} from "../../../components/GenericForm/GenericForm";
import {regex} from "../../../utils/regex";
import {useLocation, useNavigate} from "react-router-dom";
import {EthServicesContext} from "../../../providers/EthServicesProvider";
import {SignerContext} from "../../../providers/SignerProvider";
import {hideLoading, showLoading} from "../../../redux/reducers/loadingSlice";
import {useDispatch} from "react-redux";
import {NotificationType, openNotification} from "../../../utils/notification";
import {getNameByDID} from "../../../utils/utils";
import {DID_METHOD} from "../../../constants";
import {FormInstance} from "antd";
import dayjs from "dayjs";

export default function useTradeShared() {
    const {signer} = useContext(SignerContext);
    const {ethTradeService, ethDocumentService, ethUnitService, ethFiatService, ethMaterialService} = useContext(EthServicesContext);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [type, setType] = useState<TradeType>(TradeType.ORDER);

    const updateType = (newType: TradeType) => {
        setType(newType);
    }

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [units, setUnits] = useState<string[]>([]);
    const [fiats, setFiats] = useState<string[]>([]);
    const [actorNames, setActorNames] = useState<string[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [elements, setElements] = useState<FormElement[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        if (!ethUnitService || !ethFiatService || !ethMaterialService) {
            return;
        }
        try {
            dispatch(showLoading("Retrieving data..."));
            const units = await ethUnitService.getAll();
            setUnits(units);
            const fiats = await ethFiatService.getAll();
            setFiats(fiats);
            const productCategories = await ethMaterialService.getProductCategories();
            setProductCategories(productCategories);
            await getActorNames();
            setDataLoaded(true);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }

    }

    const validateDocument = async (tradeId: number, documentId: number, validationStatus: DocumentStatus) => {
        const documents = await ethDocumentService.getDocumentsByTransactionId(tradeId);
        await ethTradeService.validateDocument(tradeId, documentId, validationStatus);
        if (validationStatus === DocumentStatus.APPROVED) openNotification("Document approved", "The document has been successfully approved", NotificationType.SUCCESS, 1);
        else if (validationStatus === DocumentStatus.NOT_APPROVED) openNotification("Document rejected", "The document has been rejected", NotificationType.SUCCESS, 1);
        window.location.reload();
    }

    const validateDates = (dataFieldName: string, dateFieldNameToCompare: string, comparison: 'greater' | 'less', errorMessage: string) => {
        return (form: FormInstance): Promise<void> => {
            const date = dayjs(form.getFieldValue(dataFieldName));
            const dateToCompare = dayjs(form.getFieldValue(dateFieldNameToCompare));
            if (date && dateToCompare)
                if ((comparison === 'greater' && date.isBefore(dateToCompare)) || (comparison === 'less' && date.isAfter(dateToCompare)))
                    return Promise.reject(errorMessage);

            return Promise.resolve();
        }
    }

    const getActorNames = async () => {
        const supplierAddress = location?.state?.supplierAddress;
        const commissionerAddress = signer?.address;

        try {
            const supplier = supplierAddress ? await getNameByDID(DID_METHOD + ':' + supplierAddress) : 'Unknown';
            const commissioner = commissionerAddress ? await getNameByDID(DID_METHOD + ':' + commissionerAddress) : 'Unknown';
            setActorNames([supplier, commissioner]);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    useEffect(() => {
        if (!dataLoaded) {
            return;
        }
        const documentHeight = '45vh';

        const basicLine: FormElement[] = [
            {
                type: FormElementType.SELECT,
                span: 8,
                name: 'product-category-id-1',
                label: 'Product Category',
                required: false,
                options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
                defaultValue: productCategories.find(pc => pc.id === location?.state?.productCategoryId)?.id || -1,
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 6,
                name: `quantity-1`,
                label: 'Quantity',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `unit-1`,
                label: 'Unit',
                required: true,
                options: units.map((unit) => ({label: unit, value: unit})),
                defaultValue: '',
                disabled: false,
            },
            {type: FormElementType.SPACE, span: 6},];
        const orderLine: FormElement[] = [
            {
                type: FormElementType.SELECT,
                span: 6,
                name: 'product-category-id-1',
                label: 'Product Category',
                required: false,
                options: productCategories.map((productCategory) => ({label: productCategory.name, value: productCategory.id})),
                defaultValue: productCategories.find(pc => pc.id === location?.state?.productCategoryId)?.id || -1,
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 5,
                name: `quantity-1`,
                label: 'Quantity',
                required: true,
                regex: regex.ONLY_DIGITS,
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `unit-1`,
                label: 'Unit',
                required: true,
                options: units.map((unit) => ({label: unit, value: unit})),
                defaultValue: '',
                disabled: false,
            },
            {
                type: FormElementType.INPUT,
                span: 5,
                name: `price-1`,
                label: 'Price',
                required: true,
                defaultValue: '',
                regex: regex.ONLY_DIGITS,
                disabled: false,
            },
            {
                type: FormElementType.SELECT,
                span: 4,
                name: `fiat-1`,
                label: 'Fiat',
                required: true,
                options: fiats.map((fiat) => ({label: fiat, value: fiat})),
                defaultValue: '',
                disabled: false,
            }];
        const commonElements: FormElement[] = [
            {type: FormElementType.TITLE, span: 24, label: 'Actors'}, {
                type: FormElementType.INPUT,
                span: 8,
                name: 'supplier',
                label: 'Supplier',
                required: true,
                defaultValue: actorNames[0],
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'customer',
                label: 'Customer',
                required: true,
                defaultValue: actorNames[1],
                disabled: true,
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'commissioner',
                label: 'Commissioner',
                required: true,
                defaultValue: actorNames[1],
                disabled: true,
            },
        ];
        if (type === TradeType.BASIC) {
            setElements([
                ...commonElements,
                {type: FormElementType.TITLE, span: 24, label: 'Data'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'name',
                    // WTF is this?
                    // label: 'Reference ID',
                    label: 'Name',
                    required: true,
                    defaultValue: '',
                    disabled: false,
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
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Item'},
                ...basicLine,
            ]);
        } else {
            setElements([
                ...commonElements,
                {type: FormElementType.TITLE, span: 24, label: 'Constraints'},
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'incoterms',
                    label: 'Incoterms',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'arbiter',
                    label: 'Arbiter',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                    regex: regex.ETHEREUM_ADDRESS
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'payment-deadline',
                    label: 'Payment Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                    dependencies: ['document-delivery-deadline'],
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'document-delivery-deadline',
                    label: 'Document Delivery Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                    dependencies: ['payment-deadline'],
                    validationCallback: validateDates('document-delivery-deadline', 'payment-deadline', 'greater', 'This must be after Payment Deadline')
                },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'shipper',
                    label: 'Shipper',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'shipping-port',
                    label: 'Shipping Port',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DATE,
                    span: 8,
                    name: 'shipping-deadline',
                    label: 'Shipping Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                    dependencies: ['document-delivery-deadline'],
                    validationCallback: validateDates('shipping-deadline', 'document-delivery-deadline', 'greater', 'This must be after Document Delivery Deadline')
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'delivery-port',
                    label: 'Delivery Port',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.DATE,
                    span: 12,
                    name: 'delivery-deadline',
                    label: 'Delivery Deadline',
                    required: true,
                    defaultValue: '',
                    disabled: false,
                    dependencies: ['shipping-deadline'],
                    validationCallback: validateDates('delivery-deadline', 'shipping-deadline', 'greater', 'This must be after Shipping Deadline')
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'agreed-amount',
                    label: 'Agreed Amount',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: '',
                    disabled: false,
                },
                {
                    type: FormElementType.INPUT,
                    span: 12,
                    name: 'token-address',
                    label: 'Token Address',
                    required: true,
                    regex: regex.ETHEREUM_ADDRESS,
                    defaultValue: '',
                    disabled: false,
                },
                {type: FormElementType.TITLE, span: 24, label: 'Line Item'},
                ...orderLine,
            ])
        }
    }, [type, productCategories, actorNames, dataLoaded]);

    return {
        dataLoaded,
        validateDocument,
        validateDates,
        productCategories,
        type,
        ethTradeService,
        elements,
        updateType,
        units,
        fiats,
    }
}
