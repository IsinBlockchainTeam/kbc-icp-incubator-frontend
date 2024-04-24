import { createSlice } from "@reduxjs/toolkit";
import {SolidSpec} from "../../api/types/storage";
import {ICPIdentityDriver} from "@blockchain-lib/common";

type State = {
  subjectDid: string;
  subjectClaims: SolidSpec | undefined;
  icpIdentityDriver: ICPIdentityDriver | undefined;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    subjectDid: "",
    subjectClaims: undefined,
    icpIdentityDriver: undefined
  } as State,
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
