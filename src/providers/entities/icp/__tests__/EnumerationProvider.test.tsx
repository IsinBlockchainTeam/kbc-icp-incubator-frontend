import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { ICPAssessmentAssuranceLevelService, ICPAssessmentStandardService, ICPFiatService, ICPProcessTypeService, ICPUnitService } from '@kbc-lib/coffee-trading-management-lib';
import { useSiweIdentity } from '@/providers/auth/SiweIdentityProvider';
import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { useCallHandler } from '@/providers/errors/CallHandlerProvider';
import { Typography } from 'antd';
import { EnumerationProvider, useEnumeration } from '../EnumerationProvider';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/auth/SiweIdentityProvider');
jest.mock('@/providers/auth/SignerProvider');
jest.mock('@/providers/errors/CallHandlerProvider');
jest.mock('@/providers/storage/IcpStorageProvider');
jest.mock('@/utils/env');
jest.mock('antd', () => {
    const originalModule = jest.requireActual('antd');
    return {
        ...originalModule,
        Typography: {
            ...originalModule.Typography,
            Text: jest.fn((props) => <span {...props} />)
        }
    };
});
describe('EnumerationProvider', () => {
    const fiatServiceMethods = { getAllValues: jest.fn() }
    const processTypeServiceMethods = { getAllValues: jest.fn() }
    const unitServiceMethods = { getAllValues: jest.fn() }
    const assessmentReferenceStandardServiceMethods = { getAll: jest.fn() }
    const assessmentAssuranceLevelServiceMethods = { getAllValues: jest.fn() }
    const handleICPCall = jest.fn();

    const fiats = ['fiat1', 'fiat2'];
    const processTypes = ['type1', 'type2'];
    const units = ['unit1', 'unit2'];
    const assessmentReferenceStandards = [{ id: '1', name: 'standard1', sustainabilityCriteria: 'criteria', logoUrl: 'http://logourl', siteUrl: 'http://siteurl' }];
    const assessmentAssuranceLevels = ['level1', 'level2'];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(jest.fn());

        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: 'identity' });
        (checkAndGetEnvironmentVariable as jest.Mock).mockReturnValue('canisterId');
        (useCallHandler as jest.Mock).mockReturnValue({ handleICPCall });

        fiatServiceMethods.getAllValues.mockResolvedValue(fiats);
        processTypeServiceMethods.getAllValues.mockResolvedValue(processTypes);
        unitServiceMethods.getAllValues.mockResolvedValue(units);
        assessmentReferenceStandardServiceMethods.getAll.mockResolvedValue(assessmentReferenceStandards);
        assessmentAssuranceLevelServiceMethods.getAllValues.mockResolvedValue(assessmentAssuranceLevels);
        (ICPFiatService as jest.Mock).mockImplementation(() => ({ ...fiatServiceMethods }));
        (ICPUnitService as jest.Mock).mockImplementation(() => ({ ...unitServiceMethods }));
        (ICPProcessTypeService as jest.Mock).mockImplementation(() => ({ ...processTypeServiceMethods }));
        (ICPAssessmentStandardService as jest.Mock).mockImplementation(() => ({ ...assessmentReferenceStandardServiceMethods }));
        (ICPAssessmentAssuranceLevelService as jest.Mock).mockImplementation(() => ({ ...assessmentAssuranceLevelServiceMethods }));
    });

    it('should throw error if hook is used outside the provider', async () => {
        expect(() => renderHook(() => useEnumeration())).toThrow();
    });

    it('should render error message if identity is not initialized', async () => {
        (useSiweIdentity as jest.Mock).mockReturnValue({ identity: null });
        const mockTypographyText = Typography.Text as unknown as jest.Mock;
        renderHook(() => useEnumeration(), {
            wrapper: EnumerationProvider
        });
        expect(mockTypographyText).toHaveBeenCalledTimes(1);
        expect(mockTypographyText).toHaveBeenCalledWith(
            expect.objectContaining({
                children: 'Siwe identity not initialized'
            }),
            {}
        );
    });

    it('should load data', async () => {
        handleICPCall.mockImplementation(async (callback) => {
            await callback();
        });
        const { result } = renderHook(() => useEnumeration(), {
            wrapper: EnumerationProvider
        });
        await act(async () => {
            await result.current.loadData();
        });

        expect(handleICPCall).toHaveBeenCalledTimes(5);
        expect(fiatServiceMethods.getAllValues).toHaveBeenCalledTimes(1);
        expect(processTypeServiceMethods.getAllValues).toHaveBeenCalledTimes(1);
        expect(unitServiceMethods.getAllValues).toHaveBeenCalledTimes(1);
        expect(assessmentReferenceStandardServiceMethods.getAll).toHaveBeenCalledTimes(1);
        expect(assessmentAssuranceLevelServiceMethods.getAllValues).toHaveBeenCalledTimes(1);

        expect(result.current.dataLoaded).toBe(true);
        expect(result.current.fiats).toEqual(fiats);
        expect(result.current.processTypes).toEqual(processTypes);
        expect(result.current.units).toEqual(units);
        expect(result.current.assessmentReferenceStandards).toEqual(assessmentReferenceStandards);
        expect(result.current.assessmentAssuranceLevels).toEqual(assessmentAssuranceLevels);
    });

});

