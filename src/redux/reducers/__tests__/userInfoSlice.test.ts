import userInfoReducer, {
    initialState,
    resetUserInfo,
    updateUserInfo,
    UserInfoState
} from '@/redux/reducers/userInfoSlice';

describe('userInfoSlice', () => {
    const userInfo: UserInfoState = {
        isLogged: true,
        subjectDid: 'subjectDid',
        companyClaims: {
            legalName: 'legalName',
            industrialSector: 'industrialSector',
            address: 'address',
            email: 'email',
            nation: 'nation',
            latitude: 'latitude',
            longitude: 'longitude',
            telephone: 'telephone',
            image: 'image',
            role: 'role',
            organizationId: 'organizationId'
        },
        employeeClaims: {
            firstName: 'firstName',
            lastName: 'lastName',
            address: 'address',
            birthDate: 'birthDate',
            email: 'email',
            telephone: 'telephone',
            role: 'role',
            image: 'image'
        },
        roleProof: {
            signedProof: 'signedProof',
            delegator: 'delegator'
        }
    };
    it('should update user info', () => {
        const { isLogged, ...rest } = userInfo;
        const action = updateUserInfo({
            ...rest
        });
        const nextState = userInfoReducer(initialState, action);

        expect(nextState.isLogged).toBe(true);
        expect(nextState.subjectDid).toBe(userInfo.subjectDid);
        expect(nextState.companyClaims).toBe(userInfo.companyClaims);
        expect(nextState.employeeClaims).toBe(userInfo.employeeClaims);
        expect(nextState.roleProof).toBe(userInfo.roleProof);
    });
    it('should reset user info', () => {
        const action = resetUserInfo();
        const nextState = userInfoReducer(userInfo, action);

        expect(nextState.isLogged).toBe(false);
        expect(nextState.subjectDid).toBe(initialState.subjectDid);
        expect(nextState.companyClaims).toBe(initialState.companyClaims);
        expect(nextState.employeeClaims).toBe(initialState.employeeClaims);
        expect(nextState.roleProof).toBe(initialState.roleProof);
    });
});
