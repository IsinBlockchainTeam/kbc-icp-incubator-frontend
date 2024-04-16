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
import {
    ICPStorageDriver
} from "@blockchain-lib/common";

export default function useTradeView() {
    const { tradeService, orderState, elements } = useTradeShared();

    const {id} = useParams();
    const location = useLocation();
    const type = parseInt(new URLSearchParams(location.search).get('type')!);

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
        // const documentService = new DocumentService(new BlockchainDocumentStrategy());
        // const resp = await documentService.getDocumentsByTransactionIdAndType(id, 'trade');
        //resp && setDocuments(resp);

        const storageDriver = ICPStorageDriver.getInstance();
        const files = await storageDriver.listFiles(0);
        console.log("FILES: ", files);
        const documents = await Promise.all(files.map(async file => await storageDriver.getFile(file.file)));
        console.log("DOCUMENTS: ", documents);
        const blob = new Blob([documents[1].buffer], { type: 'application/pdf'});
        console.log("BLOB: ", blob);
        const dp = new DocumentPresentable().setContent(blob);
        console.log("DOCUMENT PRESENTABLE: ", dp);
        setDocuments([dp]);
    }

    useEffect(() => {
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
        documents,
        loadingDocuments,
        disabled,
        toggleDisabled,
        onSubmit
    }
}
