import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../../utils/notification";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../../redux/types";
import {useEffect, useState} from "react";
import {TradePresentable} from "../../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../../api/types/DocumentPresentable";
import {DocumentService} from "../../../../api/services/DocumentService";
import {BlockchainDocumentStrategy} from "../../../../api/strategies/document/BlockchainDocumentStrategy";
import {hideLoading, showLoading} from "../../../../redux/reducers/loadingSlice";

export default function useTradeView() {
    const { tradeService, orderState, elements } = useTradeShared();
    const dispatch = useDispatch();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);
    const subjectClaims = useSelector((state: RootState) => state.auth.subjectClaims);

    const [trade, setTrade] = useState<TradePresentable>();
    const [documents, setDocuments] = useState<DocumentPresentable[]>();
    const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(true);

    const toggleDisabled = () => {
        setDisabled(!disabled);
    }

    const getTradeInfo = async (id: number, type: number) => {
        try {
            dispatch(showLoading("Retrieving trade..."));
            const resp = await tradeService.getTradeByIdAndType(id, type);
            resp && setTrade(resp);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const getTradeDocuments = async (id: number) => {
        try {
            dispatch(showLoading("Retrieving documents..."));
            const documentService = new DocumentService(new BlockchainDocumentStrategy({
                serverUrl: subjectClaims!.podServerUrl!,
                sessionCredentials: {
                    podName: subjectClaims!.podName!,
                    clientId: subjectClaims!.podClientId!,
                    clientSecret: subjectClaims!.podClientSecret!
                }
            }));
            const resp = await documentService.getDocumentsByTransactionId(id);
            resp && setDocuments(resp);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    useEffect(() => {
        if (!subjectClaims || !(subjectClaims.podClientSecret && subjectClaims.podClientId && subjectClaims.podServerUrl)) {
            openNotification("Error", "No information about company storage", NotificationType.ERROR);
            return;
        }
        (async () => {
            await getTradeInfo(parseInt(id!), type);
            await getTradeDocuments(parseInt(id!));
            setLoadingDocuments(false);
        })();
    }, []);

    const onSubmit = async (values: any) => {
        try {
            dispatch(showLoading("Loading..."));
            if (values['delivery-deadline'] <= values['shipping-deadline']) {
                openNotification("Invalid dates", '', NotificationType.ERROR);
            }
            if(trade?.type === TradeType.BASIC) {
                await tradeService.putBasicTrade(trade.id, values);
            }
            setDisabled(true);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    return {
        type,
        orderState,
        elements,
        trade,
        documents,
        loadingDocuments,
        disabled,
        toggleDisabled,
        onSubmit
    }
}
