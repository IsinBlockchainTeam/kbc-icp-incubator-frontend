import {useNavigate} from "react-router-dom";
import {EthOfferService} from "../../api/services/EthOfferService";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {formatAddress} from "../../utils/utils";
import {regex} from "../../utils/regex";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";

export const OffersSupplierNew = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const offerService = new EthOfferService();

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-address',
            label: 'Supplier Address',
            required: true,
            regex: regex.ETHEREUM_ADDRESS,
            defaultValue: '',
            disabled: false
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-name',
            label: 'Supplier Name',
            required: true,
            defaultValue: '',
            disabled: false
        },
    ];

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Inserting offer supplier..."));
            await offerService.saveSupplier(values['supplier-address'], values['supplier-name']);
            openNotification("Offer supplier registered", `Offer supplier with address ${formatAddress(values['supplier-address'])} has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.OFFERS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    useEffect(() => {
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Offer Supplier
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.OFFERS)}>
                    Delete Offer Supplier
                </Button>
            </div>
        }>
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>
        </CardPage>
    );
}

export default OffersSupplierNew;
