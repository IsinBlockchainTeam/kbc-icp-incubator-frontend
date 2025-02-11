import { useSelector } from 'react-redux';
import { SessionProvider, useSession } from '@/providers/auth/SessionProvider';
import { renderHook } from '@testing-library/react';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { Organization } from '@kbc-lib/coffee-trading-management-lib';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import { RootState } from '@/redux/store';

jest.mock('@kbc-lib/coffee-trading-management-lib');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('react-redux');

describe('SessionProvider', () => {
    const mockGetOrganization = jest.fn();
    const mockUserInfo = {
        roleProof: {
            delegator: 'delegator'
        }
    } as UserInfoState;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization: mockGetOrganization
        });
        (useSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                userInfo: mockUserInfo
            } as RootState)
        );
    });

    it('should throw error if hook is used outside the provider', () => {
        expect(() => renderHook(() => useSession())).toThrow();
    });

    it('should return the logged organization', () => {
        const mockOrganization = { ethAddress: 'address' } as Organization;
        mockGetOrganization.mockReturnValue(mockOrganization);
        const { result } = renderHook(() => useSession(), {
            wrapper: SessionProvider
        });

        expect(result.current.getLoggedOrganization()).toEqual(mockOrganization);
    });
});
