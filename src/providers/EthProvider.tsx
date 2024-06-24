import React from 'react';
import { createContext, ReactNode } from 'react';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { useEthServices } from '@/providers/hooks/useEthServices';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { EthEnumerableTypeService } from '@/api/services/EthEnumerableTypeService';
import { EthGraphService } from '@/api/services/EthGraphService';
import { EthMaterialService } from '@/api/services/EthMaterialService';
import { EthOfferService } from '@/api/services/EthOfferService';
import { EthPartnerService } from '@/api/services/EthPartnerService';
import { EthTradeService } from '@/api/services/EthTradeService';

export type EthContextState = {
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
    const {
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
    } = useEthServices();

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
