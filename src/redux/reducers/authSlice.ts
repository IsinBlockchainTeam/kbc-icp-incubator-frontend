import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    subjectDid: "",
    subjectClaims: null,
  },
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
