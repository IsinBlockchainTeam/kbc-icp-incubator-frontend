import React, { createContext, useContext, useMemo, useState } from 'react';
import { useSigner } from '@/providers/SignerProvider';
import { useDispatch } from 'react-redux';
import { ASSESSMENT_ASSURANCE_LEVEL, ASSESSMENT_STANDARD_MESSAGE, FIAT_MESSAGE, PROCESS_TYPE_MESSAGE, UNIT_MESSAGE } from '@/constants/message';
import { addLoadingMessage, removeLoadingMessage } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { NOTIFICATION_DURATION } from '@/constants/notification';
import { ICPEnumeration, ICPEnumerationDriver, ICPEnumerationService } from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { ICP } from '@/constants/icp';
import { Typography } from 'antd';

export type EnumerableContextState = {
    dataLoaded: boolean;
    fiats: string[];
    processTypes: string[];
    units: string[];
    assessmentStandards: string[];
    assessmentAssuranceLevels: string[];
    loadData: () => Promise<void>;
};
export const EnumerableContext = createContext<EnumerableContextState>({} as EnumerableContextState);
export const useEnumeration = (): EnumerableContextState => {
    const context = useContext(EnumerableContext);
    if (!context || Object.keys(context).length === 0) {
        throw new Error('useEnumerable must be used within an EnumerableProvider.');
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
    const [assessmentStandards, setAssessmentStandards] = useState<string[]>([]);
    const [assessmentAssuranceLevel, setAssessmentAssuranceLevel] = useState<string[]>([]);

    const { signer } = useSigner();
    const dispatch = useDispatch();

    if (!identity) {
        return <Typography.Text>Siwe identity not initialized</Typography.Text>;
    }

    const enumerationService = useMemo(() => new ICPEnumerationService(new ICPEnumerationDriver(identity, entityManagerCanisterId)), [identity]);

    const loadFiats = async () => {
        try {
            dispatch(addLoadingMessage(FIAT_MESSAGE.RETRIEVE.LOADING));
            const fiats = await enumerationService.getEnumerationsByType(ICPEnumeration.FIAT);
            setFiats(fiats);
        } catch (e) {
            openNotification('Error', FIAT_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(FIAT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadProcessTypes = async () => {
        try {
            dispatch(addLoadingMessage(PROCESS_TYPE_MESSAGE.RETRIEVE.LOADING));
            const processTypes = await enumerationService.getEnumerationsByType(ICPEnumeration.PROCESS_TYPE);
            setProcessTypes(processTypes);
        } catch (e) {
            openNotification('Error', PROCESS_TYPE_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(PROCESS_TYPE_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadUnits = async () => {
        try {
            dispatch(addLoadingMessage(UNIT_MESSAGE.RETRIEVE.LOADING));
            const units = await enumerationService.getEnumerationsByType(ICPEnumeration.UNIT);
            setUnits(units);
        } catch (e) {
            openNotification('Error', UNIT_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(UNIT_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadAssessmentStandards = async () => {
        try {
            dispatch(addLoadingMessage(ASSESSMENT_STANDARD_MESSAGE.RETRIEVE.LOADING));
            const assessmentStandards = await enumerationService.getEnumerationsByType(ICPEnumeration.ASSESSMENT_STANDARD);
            setAssessmentStandards(assessmentStandards);
        } catch (e) {
            openNotification('Error', ASSESSMENT_STANDARD_MESSAGE.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(ASSESSMENT_STANDARD_MESSAGE.RETRIEVE.LOADING));
        }
    };

    const loadAssessmentAssuranceLevel = async () => {
        try {
            dispatch(addLoadingMessage(ASSESSMENT_ASSURANCE_LEVEL.RETRIEVE.LOADING));
            const assessmentAssuranceLevels = await enumerationService.getEnumerationsByType(ICPEnumeration.ASSESSMENT_ASSURANCE_LEVEL);
            setAssessmentAssuranceLevel(assessmentAssuranceLevels);
        } catch (e) {
            openNotification('Error', ASSESSMENT_ASSURANCE_LEVEL.RETRIEVE.ERROR, NotificationType.ERROR, NOTIFICATION_DURATION);
        } finally {
            dispatch(removeLoadingMessage(ASSESSMENT_ASSURANCE_LEVEL.RETRIEVE.LOADING));
        }
    };

    const loadData = async () => {
        await Promise.all([loadFiats(), loadProcessTypes(), loadUnits(), loadAssessmentStandards(), loadAssessmentAssuranceLevel()]);
        setDataLoaded(true);
    };

    return (
        <EnumerableContext.Provider
            value={{
                dataLoaded,
                fiats,
                processTypes,
                units,
                assessmentStandards,
                assessmentAssuranceLevels: assessmentAssuranceLevel,
                loadData
            }}>
            {props.children}
        </EnumerableContext.Provider>
    );
}
