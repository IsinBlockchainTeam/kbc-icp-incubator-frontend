import React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { EnumerableDefinition, useBlockchainLibraryUtils } from '@/hooks/useBlockchainLibraryUtils';
import { SignerContext } from './SignerProvider';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { EthEnumerableTypeService } from '@/api/services/EthEnumerableTypeService';
import { EthGraphService } from '@/api/services/EthGraphService';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { EthOfferService } from '@/api/services/EthOfferService';
import { EthPartnerService } from '@/api/services/EthPartnerService';
import { EthTradeService } from '@/api/services/EthTradeService';
import { Typography } from 'antd';
import { ICPContext } from './ICPProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

type EthContextState = {
    ethAssetOperationService: EthAssetOperationService;
    ethDocumentService: EthDocumentService;
    ethProcessTypeService: EthEnumerableTypeService;
    ethUnitService: EthEnumerableTypeService;
    ethFiatService: EthEnumerableTypeService;
    ethGraphService: EthGraphService;
    ethMaterialService: EthMaterialService;
    ethOfferService: EthOfferService;
    ethPartnerService: EthPartnerService;
    ethTradeService: EthTradeService;
};
export const EthContext = createContext<EthContextState>({} as EthContextState);
export function EthProvider({ children }: { children: ReactNode }) {
    const { fileDriver, getNameByDID } = useContext(ICPContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);
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
    } = useBlockchainLibraryUtils(fileDriver);
    const { signer } = useContext(SignerContext);

    const ethAssetOperationService = new EthAssetOperationService(
        signer.address,
        getAssetOperationService(),
        getMaterialService()
    );
    const ethDocumentService = new EthDocumentService(
        getDocumentService(),
        getTradeManagerService(),
        getTradeService
    );
    const ethProcessTypeService = new EthEnumerableTypeService(
        getEnumerableTypeService(EnumerableDefinition.PROCESS_TYPE)
    );
    const ethUnitService = new EthEnumerableTypeService(
        getEnumerableTypeService(EnumerableDefinition.UNIT)
    );
    const ethFiatService = new EthEnumerableTypeService(
        getEnumerableTypeService(EnumerableDefinition.FIAT)
    );
    const ethGraphService = new EthGraphService(getGraphService());
    const ethMaterialService = new EthMaterialService(
        signer.address,
        getProductCategoryService(),
        getMaterialService()
    );
    const ethOfferService = new EthOfferService(getOfferService());
    const ethPartnerService = new EthPartnerService(signer.address, getRelationshipService());
    const ethTradeService = new EthTradeService(
        signer.address,
        parseInt(userInfo.organizationId),
        ethMaterialService,
        getTradeManagerService(),
        ethDocumentService,
        getTradeService,
        getBasicTradeService,
        getOrderTradeService,
        waitForTransactions,
        getNameByDID
    );

    if (!signer) {
        return <Typography.Text>Signer is not initialized</Typography.Text>;
    }
    return (
        <EthContext.Provider
            value={{
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
        </EthContext.Provider>
    );
}
