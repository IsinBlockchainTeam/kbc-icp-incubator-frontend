import React, { createContext, useContext, useMemo, useState } from 'react';
import { ASSESSMENT_ASSURANCE_LEVEL, ASSESSMENT_STANDARD_MESSAGE, FIAT_MESSAGE, PROCESS_TYPE_MESSAGE, UNIT_MESSAGE } from '@/constants/message';
import {
    ICPAssessmentAssuranceLevelDriver,
    ICPAssessmentAssuranceLevelService,
    ICPAssessmentReferenceStandard,
    ICPAssessmentStandardDriver,
    ICPAssessmentStandardService,
    ICPFiatDriver,
    ICPFiatService,
    ICPProcessTypeDriver,
    ICPProcessTypeService,
    ICPUnitDriver,
    ICPUnitService
} from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';

export type EnumerableContextState = {
    dataLoaded: boolean;
    fiats: string[];
    processTypes: string[];
    units: string[];
    assessmentReferenceStandards: ICPAssessmentReferenceStandard[];
    assessmentAssuranceLevels: string[];
    loadData: () => Promise<void>;
};
export const EnumerableContext = createContext<EnumerableContextState>({} as EnumerableContextState);
export const useEnumeration = (): EnumerableContextState => {
    const context = useContext(EnumerableContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEnumerable must be used within an EnumerationProvider.');
    }
    return context;
};
export function EnumerationProvider(props: { children: React.ReactNode }) {
    const { identity } = useSiweIdentity();
    const entityManagerCanisterId = checkAndGetEnvironmentVariable(ICP.CANISTER_ID_ENTITY_MANAGER);

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [fiats, setFiats] = useState<string[]>([]);
    const [processTypes, setProcessTypes] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [assessmentReferenceStandards, setAssessmentReferenceStandards] = useState<ICPAssessmentReferenceStandard[]>([]);
    const [assessmentAssuranceLevels, setAssessmentAssuranceLevels] = useState<string[]>([]);
    const { handleICPCall } = useCallHandler();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const fiatService = useMemo(() => new ICPFiatService(new ICPFiatDriver(identity, entityManagerCanisterId)), [identity]);
    const unitService = useMemo(() => new ICPUnitService(new ICPUnitDriver(identity, entityManagerCanisterId)), [identity]);
    const processTypeService = useMemo(() => new ICPProcessTypeService(new ICPProcessTypeDriver(identity, entityManagerCanisterId)), [identity]);
    const assessmentStandardService = useMemo(
        () => new ICPAssessmentStandardService(new ICPAssessmentStandardDriver(identity, entityManagerCanisterId)),
        [identity]
    );
    const assessmentAssuranceLevelService = useMemo(
        () => new ICPAssessmentAssuranceLevelService(new ICPAssessmentAssuranceLevelDriver(identity, entityManagerCanisterId)),
        [identity]
    );

    const loadFiats = async () => {
        await handleICPCall(async () => {
            setFiats(await fiatService.getAllValues());
        }, FIAT_MESSAGE.RETRIEVE.LOADING);
    };

    const loadProcessTypes = async () => {
        await handleICPCall(async () => {
            setProcessTypes(await processTypeService.getAllValues());
        }, PROCESS_TYPE_MESSAGE.RETRIEVE.LOADING);
    };

    const loadUnits = async () => {
        await handleICPCall(async () => {
            setUnits(await unitService.getAllValues());
        }, UNIT_MESSAGE.RETRIEVE.LOADING);
    };

    const loadAssessmentReferenceStandards = async () => {
        await handleICPCall(async () => {
            setAssessmentReferenceStandards(await assessmentStandardService.getAll());
        }, ASSESSMENT_STANDARD_MESSAGE.RETRIEVE.LOADING);
    };

    const loadAssessmentAssuranceLevel = async () => {
        await handleICPCall(async () => {
            setAssessmentAssuranceLevels(await assessmentAssuranceLevelService.getAllValues());
        }, ASSESSMENT_ASSURANCE_LEVEL.RETRIEVE.LOADING);
    };

    const loadData = async () => {
        await Promise.all([loadFiats(), loadProcessTypes(), loadUnits(), loadAssessmentReferenceStandards(), loadAssessmentAssuranceLevel()]);
        setDataLoaded(true);
    };

    return (
        <EnumerableContext.Provider
            value={{
                dataLoaded,
                fiats,
                processTypes,
                units,
                assessmentReferenceStandards,
                assessmentAssuranceLevels,
                loadData
            }}>
            {props.children}
        </EnumerableContext.Provider>
    );
}
