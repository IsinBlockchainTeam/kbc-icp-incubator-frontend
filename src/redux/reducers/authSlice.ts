import { createSlice } from "@reduxjs/toolkit";

type State = {
  subjectDid: string;
}

const initialState: State = {
    subjectDid: "",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateSubjectDid: (state: State, action) => {
      state.subjectDid = action.payload;
    },
  },
});

export const { updateSubjectDid } = authSlice.actions;

export default authSlice.reducer;
