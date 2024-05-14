import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {EthAssetOperationService} from "../api/services/EthAssetOperationService";
import {EnumerableDefinition, useBlockchainLibraryUtils} from "../hooks/useBlockchainLibraryUtils";
import {SignerContext} from "./SignerProvider";
import {EthDocumentService} from "../api/services/EthDocumentService";
import {EthEnumerableTypeService} from "../api/services/EthEnumerableTypeService";
import {EthGraphService} from "../api/services/EthGraphService";
import {EthMaterialService} from "../api/services/EthMaterialService";
import {EthOfferService} from "../api/services/EthOfferService";
import {EthPartnerService} from "../api/services/EthPartnerService";
import {EthTradeService} from "../api/services/EthTradeService";
import {ICPDriversContext} from "./ICPDriversProvider";

type EthServicesContextState = {
    ethAssetOperationService: EthAssetOperationService | null,
    ethDocumentService: EthDocumentService | null,
    ethProcessTypeService: EthEnumerableTypeService | null,
    ethUnitService: EthEnumerableTypeService | null,
    ethFiatService: EthEnumerableTypeService | null,
    ethGraphService: EthGraphService | null,
    ethMaterialService: EthMaterialService | null,
    ethOfferService: EthOfferService | null,
    ethPartnerService: EthPartnerService | null,
    ethTradeService: EthTradeService | null
}
const initialState: EthServicesContextState = {
    ethAssetOperationService: null,
    ethDocumentService: null,
    ethProcessTypeService: null,
    ethUnitService: null,
    ethFiatService: null,
    ethGraphService: null,
    ethMaterialService: null,
    ethOfferService: null,
    ethPartnerService: null,
    ethTradeService: null
}
export const EthServicesContext = createContext<EthServicesContextState>(initialState);
export function EthServicesProvider({ children }: { children: ReactNode }) {
    const {
        waitForTransactions,
        getProductCategoryService,
        getMaterialService,
        getRelationshipService,
        getTradeManagerService,
        getTradeService,
        getBasicTradeService,
        getOrderTradeService,
        getAssetOperationService,
        getDocumentService,
        getOfferService,
        getGraphService,
        getEnumerableTypeService
    } = useBlockchainLibraryUtils();
    const isDriverInitialized = useContext(ICPDriversContext);
    const {signer} = useContext(SignerContext);

    const [ethAssetOperationService, setEthAssetOperationService] = useState<EthAssetOperationService | null>(null);
    const [ethDocumentService, setEthDocumentService] = useState<EthDocumentService | null>(null);
    const [ethProcessTypeService, setEthProcessTypeService] = useState<EthEnumerableTypeService | null>(null);
    const [ethUnitService, setEthUnitService] = useState<EthEnumerableTypeService | null>(null);
    const [ethFiatService, setEthFiatService] = useState<EthEnumerableTypeService | null>(null);
    const [ethGraphService, setEthGraphService] = useState<EthGraphService | null>(null);
    const [ethMaterialService, setEthMaterialService] = useState<EthMaterialService | null>(null);
    const [ethOfferService, setEthOfferService] = useState<EthOfferService | null>(null);
    const [ethPartnerService, setEthPartnerService] = useState<EthPartnerService | null>(null);
    const [ethTradeService, setEthTradeService] = useState<EthTradeService | null>(null);

    useEffect(() => {
        if(!signer || !isDriverInitialized) {
            setEthAssetOperationService(null);
            setEthDocumentService(null);
            setEthProcessTypeService(null);
            setEthUnitService(null);
            setEthFiatService(null);
            setEthGraphService(null);
            setEthMaterialService(null);
            setEthOfferService(null);
            setEthPartnerService(null);
            setEthTradeService(null);
            return;
        }
        const ethAssetOperationService = new EthAssetOperationService(signer.address, getAssetOperationService(), getMaterialService());
        const ethDocumentService = new EthDocumentService(getDocumentService(), getTradeManagerService(), getTradeService);
        const ethProcessTypeService = new EthEnumerableTypeService(getEnumerableTypeService(EnumerableDefinition.PROCESS_TYPE));
        const ethUnitService = new EthEnumerableTypeService(getEnumerableTypeService(EnumerableDefinition.UNIT));
        const ethFiatService = new EthEnumerableTypeService(getEnumerableTypeService(EnumerableDefinition.FIAT));
        const ethGraphService = new EthGraphService(getGraphService());
        const ethMaterialService = new EthMaterialService(signer.address, getProductCategoryService(), getMaterialService());
        const ethOfferService = new EthOfferService(getOfferService());
        const ethPartnerService = new EthPartnerService(signer.address, getRelationshipService());
        const ethTradeService = new EthTradeService(
            signer.address,
            ethMaterialService,
            getTradeManagerService(),
            ethDocumentService,
            getTradeService,
            getBasicTradeService,
            getOrderTradeService,
            waitForTransactions
        );
        setEthAssetOperationService(ethAssetOperationService);
        setEthDocumentService(ethDocumentService);
        setEthProcessTypeService(ethProcessTypeService);
        setEthUnitService(ethUnitService);
        setEthFiatService(ethFiatService);
        setEthGraphService(ethGraphService);
        setEthMaterialService(ethMaterialService);
        setEthOfferService(ethOfferService);
        setEthPartnerService(ethPartnerService);
        setEthTradeService(ethTradeService);
    }, [signer, isDriverInitialized]);

    return (
        <EthServicesContext.Provider value={{
            ethAssetOperationService,
            ethDocumentService,
            ethProcessTypeService,
            ethUnitService,
            ethFiatService,
            ethGraphService,
            ethMaterialService,
            ethOfferService,
            ethPartnerService,
            ethTradeService
        }}>
            {children}
        </EthServicesContext.Provider>
    )
}
