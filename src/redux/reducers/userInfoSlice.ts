import { createSlice } from '@reduxjs/toolkit';
import { RoleProof } from '@isinblockchainteam/kbc-icp-incubator-library';

export type CompanyClaimsState = {
    legalName: string;
    industrialSector: string;
    address: string;
    city: string;
    postalCode: string;
    region: string;
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
    address: string;
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
    roleProof: RoleProof;
};

export const initialState: UserInfoState = {
    isLogged: false,
    subjectDid: '',
    companyClaims: {
        legalName: '',
        industrialSector: '',
        address: '',
        city: '',
        postalCode: '',
        region: '',
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
        address: '',
        birthDate: '',
        email: '',
        telephone: '',
        role: '',
        image: ''
    },
    roleProof: {
        signedProof: '',
        delegator: '',
        delegateRole: '',
        delegateCredentialIdHash: '',
        delegateCredentialExpiryDate: 0,
        membershipProof: {
            signedProof: '',
            delegatorCredentialIdHash: '',
            delegatorCredentialExpiryDate: 0,
            issuer: ''
        }
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
            state.roleProof = action.payload.roleProof;
        },
        resetUserInfo: (state: UserInfoState) => {
            state.isLogged = false;
            state.subjectDid = initialState.subjectDid;
            state.companyClaims = initialState.companyClaims;
            state.employeeClaims = initialState.employeeClaims;
            state.roleProof = initialState.roleProof;
        }
    }
});
export const { updateUserInfo, resetUserInfo } = userInfoSlice.actions;

export default userInfoSlice.reducer;
