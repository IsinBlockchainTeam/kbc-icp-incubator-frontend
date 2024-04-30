import { createSlice } from "@reduxjs/toolkit";
import {SolidSpec} from "../../api/types/storage";

type State = {
  subjectDid: string;
  subjectClaims: SolidSpec | undefined;
}

const initialState: State = {
    subjectDid: "",
    subjectClaims: undefined,
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
  },
});

export const { updateSubjectDid, updateSubjectClaims } = authSlice.actions;

export default authSlice.reducer;
