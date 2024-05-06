import { createSlice } from "@reduxjs/toolkit";
import {SolidSpec} from "../../api/types/storage";
import {ICPIdentityDriver} from "@blockchain-lib/common";

type State = {
  subjectDid: string;
  subjectClaims: SolidSpec | undefined;
  icpIdentityDriver: ICPIdentityDriver | undefined;
}

const initialState: State = {
    subjectDid: "",
    subjectClaims: undefined,
    icpIdentityDriver: undefined
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateSubjectDid: (state: State, action) => {
      state.subjectDid = action.payload;
    },
    updateSubjectClaims: (state: State, action) => {
      state.subjectClaims = action.payload;
    },
    updateIcpIdentityDriver: (state: State, action) => {
      state.icpIdentityDriver = action.payload;
    }
  },
});

export const { updateSubjectDid, updateSubjectClaims, updateIcpIdentityDriver } = authSlice.actions;

export default authSlice.reducer;
