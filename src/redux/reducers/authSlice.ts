import { createSlice } from "@reduxjs/toolkit";
import {SolidSpec} from "../../api/types/storage";
import {ICPIdentityDriver} from "@blockchain-lib/common";
import {OrganizationCredential} from "../../api/types/OrganizationCredential";

export type AuthState = {
  subjectDid: string;
  subjectClaims: OrganizationCredential | null;
  icpIdentityDriver: ICPIdentityDriver | null;
}

const initialState: AuthState = {
    subjectDid: "",
    subjectClaims: null,
    icpIdentityDriver: null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateSubjectDid: (state, action) => {
      state.subjectDid = action.payload;
    },
    updateSubjectClaims: (state, action) => {
      state.subjectClaims = action.payload;
    },
    updateIcpIdentityDriver: (state, action) => {
      state.icpIdentityDriver = action.payload;
    }
  },
});

export const { updateSubjectDid, updateSubjectClaims, updateIcpIdentityDriver } = authSlice.actions;

export default authSlice.reducer;
