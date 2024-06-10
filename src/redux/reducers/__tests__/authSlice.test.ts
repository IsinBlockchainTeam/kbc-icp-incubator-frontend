import authReducer, { updateSubjectClaims, updateSubjectDid } from '../authSlice';
import { OrganizationCredential } from '../../../api/types/OrganizationCredential';

describe('UNIT TEST: authSlice', () => {
    test('updates subjectDid', () => {
        const initialState = {
            subjectDid: '',
            subjectClaims: undefined,
            icpIdentityDriver: undefined
        };

        const action = updateSubjectDid('newSubjectDid');
        const nextState = authReducer(initialState, action);

        expect(nextState.subjectDid).toBe('newSubjectDid');
        expect(nextState.subjectClaims).toBeUndefined();
    });

    test('updates subjectClaims', () => {
        const initialState = {
            subjectDid: '',
            subjectClaims: undefined,
            icpIdentityDriver: undefined
        };

        const newSubjectClaims: OrganizationCredential = {
            legalName: 'Test Organization',
            address: '123 Test St',
            email: 'email@test.ch',
            image: 'https://www.example.com/image.png'
        };

        const action = updateSubjectClaims(newSubjectClaims);
        const nextState = authReducer(initialState, action);

        expect(nextState.subjectDid).toBe('');
        expect(nextState.subjectClaims).toBe(newSubjectClaims);
    });
});
