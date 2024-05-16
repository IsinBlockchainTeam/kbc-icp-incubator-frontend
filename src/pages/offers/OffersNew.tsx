import {Navigate, useNavigate} from "react-router-dom";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";
import {NotificationType, openNotification} from "../../utils/notification";
import {credentials, DID_METHOD, paths} from "../../constants";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import React, {useContext, useEffect} from "react";
import {regex} from "../../utils/regex";
import {useDispatch, useSelector} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {RootState} from "../../redux/store";
import {EthServicesContext} from "../../providers/EthServicesProvider";
import {SignerContext} from "../../providers/SignerProvider";
import {getNameByDID} from "../../utils/utils";

export const OffersNew = () => {
    const {signer} = useContext(SignerContext);
    const {ethOfferService} = useContext(EthServicesContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const [elements, setElements] = React.useState<FormElement[]>([]);

    useEffect(() => {
        dispatch(showLoading("Loading..."));
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    useEffect(() => {
        (async () => {
            const supplierName = await getNameByDID(DID_METHOD + ':' + signer?.address) || "Unknown";
            setElements([
                {type: FormElementType.TITLE, span: 24, label: 'Data'},
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'offeror',
                    label: 'Offeror Company Address',
                    required: true,
                    defaultValue: supplierName,
                    disabled: true
                },
                {
                    type: FormElementType.INPUT,
                    span: 8,
                    name: 'product-category-id',
                    label: 'Product Category ID',
                    required: true,
                    regex: regex.ONLY_DIGITS,
                    defaultValue: '',
                    disabled: false
                },
            ]);
            dispatch(hideLoading());
        })();
    }, []);

    if(userInfo.role !== credentials.ROLE_EXPORTER) {
        return (
            <Navigate to={paths.HOME} />
        )
    }

    const onSubmit = async (values: any) => {
        if(!ethOfferService) {
            console.error("EthOfferService not found");
            return;
        }
        try {
            values['offeror'] = signer?.address || 'Unknown';
            dispatch(showLoading("Creating offer..."));
            await ethOfferService.saveOffer(values.offeror, values['product-category-id']);
            openNotification("Offer registered", `Offer for product category with ID "${values['product-category-id']}" has been registered correctly!`, NotificationType.SUCCESS, 1);
            navigate(paths.OFFERS);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error",   "Supplier not register", NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }

    }

    return (
        <CardPage title={
            <div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                New Offer
                <Button type="primary" danger icon={<DeleteOutlined/>} onClick={() => navigate(paths.OFFERS)}>
                    Delete Offer
                </Button>
            </div>
        }>
            {elements && <GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>}
        </CardPage>
    );
}

export default OffersNew;
