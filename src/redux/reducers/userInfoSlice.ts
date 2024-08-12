import { createSlice } from '@reduxjs/toolkit';

export type CompanyClaimsState = {
    legalName: string;
    industrialSector: string;
    address: string;
    email: string;
    nation: string;
    latitude: string;
    longitude: string;
    telephone: string;
    image: string;
    role: string;
    organizationId: string;
};
export type EmployeeClaimsState = {
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    telephone: string;
    role: string;
    image: string;
};
export type UserInfoState = {
    isLogged: boolean;
    subjectDid: string;
    companyClaims: CompanyClaimsState;
    employeeClaims: EmployeeClaimsState;
};

export const initialState: UserInfoState = {
    isLogged: false,
    subjectDid: '',
    companyClaims: {
        legalName: '',
        industrialSector: '',
        address: '',
        email: '',
        nation: '',
        latitude: '',
        longitude: '',
        telephone: '',
        image: '',
        role: '',
        organizationId: ''
    },
    employeeClaims: {
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        telephone: '',
        role: '',
        image: ''
    }
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
            state.isLogged = true;
            state.subjectDid = action.payload.subjectDid;
            state.companyClaims = action.payload.companyClaims;
            state.employeeClaims = action.payload.employeeClaims;
        },
        resetUserInfo: (state: UserInfoState) => {
            state.isLogged = false;
            state.subjectDid = initialState.subjectDid;
            state.companyClaims = initialState.companyClaims;
            state.employeeClaims = initialState.employeeClaims;
        }
    }
});
export const { updateUserInfo, resetUserInfo } = userInfoSlice.actions;

export default userInfoSlice.reducer;
