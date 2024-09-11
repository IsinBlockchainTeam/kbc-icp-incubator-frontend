import userInfoReducer, {
    initialState,
    resetUserInfo,
    updateUserInfo,
    UserInfoState
} from '@/redux/reducers/userInfoSlice';

describe('userInfoSlice', () => {
    const userInfo: UserInfoState = {
        ...initialState,
        isLogged: true
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
