import { checkAndGetEnvironmentVariable } from '@/utils/env';
import { URL_SEGMENTS } from '@kbc-lib/coffee-trading-management-lib';
import { getICPCanisterURL } from '@/utils/icp';

jest.mock('@/utils/env');

describe('getICPCanisterURL', () => {
    const mockCheckAndGetEnvironmentVariable =
        checkAndGetEnvironmentVariable as jest.MockedFunction<
            typeof checkAndGetEnvironmentVariable
        >;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns local URL when DFX_NETWORK is local', () => {
        mockCheckAndGetEnvironmentVariable.mockReturnValue('local');
        const canisterId = 'abcd';
        const result = getICPCanisterURL(canisterId);
        expect(result).toEqual(URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.LOCAL_REPLICA);
    });

    it('returns mainnet URL when DFX_NETWORK is not local', () => {
        mockCheckAndGetEnvironmentVariable.mockReturnValue('mainnet');
        const canisterId = 'abcd';
        const result = getICPCanisterURL(canisterId);
        expect(result).toEqual(URL_SEGMENTS.HTTP + canisterId + '.' + URL_SEGMENTS.MAINNET);
    });
});
