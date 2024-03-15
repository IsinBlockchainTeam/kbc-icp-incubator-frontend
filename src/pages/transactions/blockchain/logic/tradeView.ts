import useTradeShared from "./tradeShared";
import {NotificationType, openNotification} from "../../../../utils/notification";
import {TradeType} from "@kbc-lib/coffee-trading-management-lib";
import {useLocation, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux/types";
import {useEffect, useState} from "react";
import {TradePresentable} from "../../../../api/types/TradePresentable";
import {DocumentPresentable} from "../../../../api/types/DocumentPresentable";
import {DocumentService} from "../../../../api/services/DocumentService";
import {BlockchainDocumentStrategy} from "../../../../api/strategies/document/BlockchainDocumentStrategy";

export default function useTradeView() {
    const { tradeService, orderState, elements } = useTradeShared();

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
        const resp = await tradeService.getTradeByIdAndType(id, type);
        resp && setTrade(resp);
    }

    const getTradeDocuments = async (id: number) => {
        const documentService = new DocumentService(new BlockchainDocumentStrategy({
            serverUrl: subjectClaims!.podServerUrl!,
            clientId: subjectClaims!.podClientId!,
            clientSecret: subjectClaims!.podClientSecret!
        }));
        const resp = await documentService.getDocumentsByTransactionIdAndType(id, 'trade');
        resp && setDocuments(resp);
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
        if (values['delivery-deadline'] <= values['shipping-deadline']) {
            openNotification("Invalid dates", '', NotificationType.ERROR);
        }
        if(trade?.type === TradeType.BASIC) {
            await tradeService.putBasicTrade(trade.id, values);
        }
        setDisabled(true);
    }

    return {
        type,
        orderState,
        elements,
        trade,
        loadingDocuments,
        disabled,
        toggleDisabled,
        onSubmit
    }
}