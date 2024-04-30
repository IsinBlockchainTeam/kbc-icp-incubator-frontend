import {createSlice} from "@reduxjs/toolkit";

export type UserInfoState = {
    isLogged: boolean;
    id: string;
    legalName: string;
    email: string;
    address: string;
    nation: string;
    telephone: string;
    image: string;
    privateKey: string,
}

const initialState: UserInfoState = {
    isLogged: false,
    id: "",
    legalName: "",
    email: "",
    address: "",
    nation: "",
    telephone: "",
    image: "",
    privateKey: "",
}
const userInfoSlice = createSlice({
    name: "userInfo",
    initialState,
    reducers: {
        updateUserInfo: (state: UserInfoState, action: {payload: UserInfoState, type: string}) => {
            state.isLogged = action.payload.isLogged;
            state.id = action.payload.id;
            state.legalName = action.payload.legalName;
            state.email = action.payload.email;
            state.address = action.payload.address;
            state.nation = action.payload.nation;
            state.telephone = action.payload.telephone;
            state.image = action.payload.image;
            state.privateKey = action.payload.privateKey;
        },

    },
});
export const { updateUserInfo } = userInfoSlice.actions;

export default userInfoSlice.reducer;
