import { createSlice } from "@reduxjs/toolkit";
import {OrganizationCredential} from "../../api/types/OrganizationCredential";

export type AuthState = {
  subjectDid: string;
  subjectClaims: OrganizationCredential | null;
}

const initialState: AuthState = {
    subjectDid: "",
    subjectClaims: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateSubjectDid: (state: AuthState, action) => {
      state.subjectDid = action.payload;
    },
    updateSubjectClaims: (state: AuthState, action) => {
      state.subjectClaims = action.payload;
    },
  },
});

export const { updateSubjectDid, updateSubjectClaims } = authSlice.actions;

export default authSlice.reducer;
