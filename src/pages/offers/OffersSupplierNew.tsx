import {Navigate, useNavigate} from "react-router-dom";
import {EthOfferService} from "../../api/services/EthOfferService";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {credentials, paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {formatAddress} from "../../utils/utils";
import {regex} from "../../utils/regex";
import {useDispatch, useSelector} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {RootState} from "../../redux/store";
import SingletonSigner from "../../api/SingletonSigner";

export const OffersSupplierNew = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const offerService = new EthOfferService();

    const elements: FormElement[] = [
        {type: FormElementType.TITLE, span: 24, label: 'Data'},
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-address',
            label: 'Supplier Address',
            required: false,
            defaultValue: SingletonSigner.getInstance()?.address || 'Unknown',
            disabled: true
        },
        {
            type: FormElementType.INPUT,
            span: 8,
            name: 'supplier-name',
            label: 'Supplier Name',
            required: false,
            defaultValue: userInfo.legalName || 'Unknown',
            disabled: true
        },
    ];

    const onSubmit = async (values: any) => {
        try {
            values['supplier-address'] = SingletonSigner.getInstance()?.address || 'Unknown';
            values['supplier-name'] = userInfo.legalName || 'Unknown';
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

    if(userInfo.role !== credentials.ROLE_EXPORTER) {
        return (
            <Navigate to={paths.HOME} />
        )
    }

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
