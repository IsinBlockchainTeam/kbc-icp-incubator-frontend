import userInfoReducer, {
    resetUserInfo,
    updateUserInfo,
    UserInfoState
} from '@/redux/reducers/userInfoSlice';

describe('userInfoSlice', () => {
    it('should update user info', () => {
        const initialState: UserInfoState = {
            isLogged: false,
            id: '',
            legalName: '',
            email: '',
            address: '',
            nation: '',
            telephone: '',
            image: '',
            role: '',
            organizationId: '',
            privateKey: ''
        };
        const action = updateUserInfo({
            id: 'id',
            legalName: 'legalName',
            email: 'email',
            address: 'address',
            nation: 'nation',
            telephone: 'telephone',
            image: 'image',
            role: 'role',
            organizationId: 'organizationId',
            privateKey: 'privateKey'
        });
        const nextState = userInfoReducer(initialState, action);

        expect(nextState.isLogged).toBe(true);
        expect(nextState.id).toBe('id');
        expect(nextState.legalName).toBe('legalName');
        expect(nextState.email).toBe('email');
        expect(nextState.address).toBe('address');
        expect(nextState.nation).toBe('nation');
        expect(nextState.telephone).toBe('telephone');
        expect(nextState.image).toBe('image');
        expect(nextState.role).toBe('role');
        expect(nextState.organizationId).toBe('organizationId');
        expect(nextState.privateKey).toBe('privateKey');
    });
    it('should reset user info', () => {
        const initialState = {
            isLogged: true,
            id: 'id',
            legalName: 'legalName',
            email: 'email',
            address: 'address',
            nation: 'nation',
            telephone: 'telephone',
            image: 'image',
            role: 'role',
            organizationId: 'organizationId',
            privateKey: 'privateKey'
        };
        const action = resetUserInfo();
        const nextState = userInfoReducer(initialState, action);

        expect(nextState.isLogged).toBe(false);
        expect(nextState.id).toBe('');
        expect(nextState.legalName).toBe('');
        expect(nextState.email).toBe('');
        expect(nextState.address).toBe('');
        expect(nextState.nation).toBe('');
        expect(nextState.telephone).toBe('');
        expect(nextState.image).toBe('');
        expect(nextState.role).toBe('');
        expect(nextState.organizationId).toBe('');
        expect(nextState.privateKey).toBe('');
    });
});
