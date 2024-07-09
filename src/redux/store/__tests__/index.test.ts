import { store, RootState } from '../index';

describe('store', () => {
    test('configures store', () => {
        expect(store).toBeDefined();
    });

    test('RootState has the correct initial state', () => {
        const initialState: RootState = store.getState();

        expect(initialState.loading.isLoading).toBe(false);
        expect(initialState.loading.loadingMessage).toBe('');
        expect(initialState.siweIdentity.isLogged).toBe(false);
        expect(initialState.siweIdentity.address).toBe('');
        expect(initialState.siweIdentity.sessionIdentity).toBe('');
        expect(initialState.siweIdentity.delegationChain).toBe('');
        expect(initialState.userInfo.isLogged).toBe(false);
        expect(initialState.userInfo.id).toBe('');
        expect(initialState.userInfo.legalName).toBe('');
        expect(initialState.userInfo.email).toBe('');
        expect(initialState.userInfo.address).toBe('');
        expect(initialState.userInfo.nation).toBe('');
        expect(initialState.userInfo.telephone).toBe('');
        expect(initialState.userInfo.image).toBe('');
        expect(initialState.userInfo.role).toBe('');
        expect(initialState.userInfo.organizationId).toBe('');
        expect(initialState.userInfo.privateKey).toBe('');
    });
});
