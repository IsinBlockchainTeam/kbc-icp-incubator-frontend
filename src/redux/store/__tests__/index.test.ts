import { RootState, store } from '../index';
import { initialState as userInfoInitialState } from '@/redux/reducers/userInfoSlice';

describe('store', () => {
    test('configures store', () => {
        expect(store).toBeDefined();
    });

    test('RootState has the correct initial state', () => {
        const initialState: RootState = store.getState();

        expect(initialState.loading.isLoading).toBe(false);
        expect(initialState.loading.loadingMessages).toStrictEqual({});
        expect(initialState.siweIdentity.isLogged).toBe(false);
        expect(initialState.siweIdentity.address).toBe('');
        expect(initialState.siweIdentity.sessionIdentity).toBe('');
        expect(initialState.siweIdentity.delegationChain).toBe('');
        expect(initialState.userInfo.isLogged).toBe(false);
        expect(initialState.userInfo.subjectDid).toBe(userInfoInitialState.subjectDid);
        expect(initialState.userInfo.companyClaims).toBe(userInfoInitialState.companyClaims);
        expect(initialState.userInfo.employeeClaims).toBe(userInfoInitialState.employeeClaims);
    });
});
