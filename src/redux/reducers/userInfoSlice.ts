import { createSlice } from '@reduxjs/toolkit';

export type UserInfoState = {
    isLogged: boolean;
    id: string;
    legalName: string;
    email: string;
    address: string;
    nation: string;
    telephone: string;
    image: string;
    role: string;
    organizationId: string;
    privateKey: string;
};

export const initialState: UserInfoState = {
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
export type UpdatableUserInfoState = Omit<UserInfoState, 'isLogged'>;

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        updateUserInfo: (
            state: UserInfoState,
            action: { payload: UpdatableUserInfoState; type: string }
        ) => {
            state.id = action.payload.id;
            state.legalName = action.payload.legalName;
            state.email = action.payload.email;
            state.address = action.payload.address;
            state.nation = action.payload.nation;
            state.telephone = action.payload.telephone;
            state.image = action.payload.image;
            state.role = action.payload.role;
            state.organizationId = action.payload.organizationId;
            state.privateKey = action.payload.privateKey;
        },
        resetUserInfo: (state: UserInfoState) => {
            state.isLogged = false;
            state.id = '';
            state.legalName = '';
            state.email = '';
            state.address = '';
            state.nation = '';
            state.telephone = '';
            state.image = '';
            state.role = '';
            state.organizationId = '';
            state.privateKey = '';
        },
        setLogged: (state: UserInfoState, action: { payload: boolean; type: string }) => {
            state.isLogged = action.payload;
        }
    }
});
export const { updateUserInfo, resetUserInfo, setLogged } = userInfoSlice.actions;

export default userInfoSlice.reducer;
