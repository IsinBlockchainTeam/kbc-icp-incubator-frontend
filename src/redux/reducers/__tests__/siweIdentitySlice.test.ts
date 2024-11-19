import siweIdentityReducer, {
    clearSiweIdentity,
    selectSiweIdentity,
    SiweIdentityState,
    updateSiweIdentity
} from '@/redux/reducers/siweIdentitySlice';
import { DelegationChain, DelegationIdentity } from '@dfinity/identity';

jest.mock('@dfinity/identity');

describe('siweIdentitySlice', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should update siwe identity', () => {
        const initialState: SiweIdentityState = {
            isLogged: false,
            address: '',
            sessionIdentity: '',
            delegationChain: ''
        };
        const action = updateSiweIdentity({
            address: 'address',
            sessionIdentity: 'sessionIdentity',
            delegationChain: 'delegationChain'
        });
        const nextState = siweIdentityReducer(initialState, action);

        expect(nextState.isLogged).toBe(true);
        expect(nextState.address).toBe('address');
        expect(nextState.sessionIdentity).toBe('sessionIdentity');
        expect(nextState.delegationChain).toBe('delegationChain');
    });
    it('should clear siwe identity', () => {
        const initialState: SiweIdentityState = {
            isLogged: true,
            address: 'address',
            sessionIdentity: 'sessionIdentity',
            delegationChain: 'delegationChain'
        };
        const action = clearSiweIdentity();
        const nextState = siweIdentityReducer(initialState, action);

        expect(nextState.isLogged).toBe(false);
        expect(nextState.address).toBe('');
        expect(nextState.sessionIdentity).toBe('');
        expect(nextState.delegationChain).toBe('');
    });
    it('should select siwe identity', () => {
        const state = {
            siweIdentity: {
                isLogged: true,
                address: 'address',
                sessionIdentity: 'sessionIdentity',
                delegationChain: 'delegationChain'
            }
        };
        (DelegationIdentity.fromDelegation as jest.Mock).mockReturnValue('sessionIdentity');
        (DelegationChain.fromJSON as jest.Mock).mockReturnValue('delegationChain');
        const result = selectSiweIdentity(state);

        expect(result).not.toBeNull();
        expect(result?.address).toBe('address');
        expect(result?.sessionIdentity).toBe('sessionIdentity');
        expect(result?.delegationChain).toBe('delegationChain');
    });
    it('should select null when siwe identity is not logged', () => {
        const state = {
            siweIdentity: {
                isLogged: false,
                address: 'address',
                sessionIdentity: 'sessionIdentity',
                delegationChain: 'delegationChain'
            }
        };
        const result = selectSiweIdentity(state);

        expect(result).toBeNull();
    });
    it('should select null when siwe identity is invalid', () => {
        const state = {
            siweIdentity: {
                isLogged: true,
                address: 'address',
                sessionIdentity: 'sessionIdentity',
                delegationChain: ''
            }
        };
        const result = selectSiweIdentity(state);

        expect(result).toBeNull();
    });
});
