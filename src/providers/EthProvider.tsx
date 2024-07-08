import React from 'react';
import { createContext, ReactNode } from 'react';
import { EthAssetOperationService } from '@/api/services/EthAssetOperationService';
import { useEthServices } from '@/providers/hooks/useEthServices';
import { EthGraphService } from '@/api/services/EthGraphService';
import { EthPartnerService } from '@/api/services/EthPartnerService';

export type EthContextState = {
    ethAssetOperationService: EthAssetOperationService;
    ethGraphService: EthGraphService;
    ethPartnerService: EthPartnerService;
};
export const EthContext = createContext<EthContextState>({} as EthContextState);
export function EthProvider({ children }: { children: ReactNode }) {
    const { ethAssetOperationService, ethGraphService, ethPartnerService } = useEthServices();

    return (
        <EthContext.Provider
            value={{
                ethAssetOperationService,
                ethGraphService,
                ethPartnerService
            }}>
            {children}
        </EthContext.Provider>
    );
}
