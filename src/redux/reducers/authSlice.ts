import { createSlice } from "@reduxjs/toolkit";
import {SolidSpec} from "../../api/types/storage";

type State = {
  subjectDid: string;
  subjectClaims: SolidSpec | undefined;
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
