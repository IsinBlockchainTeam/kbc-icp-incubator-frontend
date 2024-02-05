import { createSlice } from "@reduxjs/toolkit";
import {CompanyPodInfo} from "../../api/types/solid";

type State = {
  subjectDid: string;
  subjectClaims: CompanyPodInfo | undefined;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    subjectDid: "",
    subjectClaims: undefined,
  } as State,
  reducers: {
    updateSubjectDid: (state, action) => {
      state.subjectDid = action.payload;
    },
    updateSubjectClaims: (state, action) => {
      state.subjectClaims = action.payload;
    },
  },
});

export const { updateSubjectDid, updateSubjectClaims } = authSlice.actions;

export default authSlice.reducer;
