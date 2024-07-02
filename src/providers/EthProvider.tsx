import React from 'react';
import { createContext, ReactNode } from 'react';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { useEthServices } from '@/providers/hooks/useEthServices';
import { EthDocumentService } from '@/api/services/EthDocumentService';
import { EthGraphService } from '@/api/services/EthGraphService';
import { EthPartnerService } from '@/api/services/EthPartnerService';
import { EthTradeService } from '@/api/services/EthTradeService';

export type EthContextState = {
    ethAssetOperationService: EthAssetOperationService;
    ethDocumentService: EthDocumentService;
    ethGraphService: EthGraphService;
    ethPartnerService: EthPartnerService;
    ethTradeService: EthTradeService;
};
export const EthContext = createContext<EthContextState>({} as EthContextState);
export function EthProvider({ children }: { children: ReactNode }) {
    const {
        ethAssetOperationService,
        ethDocumentService,
        ethGraphService,
        ethPartnerService,
        ethTradeService
    } = useEthServices();

    return (
        <EthContext.Provider
            value={{
                ethAssetOperationService,
                ethDocumentService,
                ethGraphService,
                ethPartnerService,
                ethTradeService
            }}>
            {children}
        </EthContext.Provider>
    );
}
