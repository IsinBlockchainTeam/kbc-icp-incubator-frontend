import { createSlice } from '@reduxjs/toolkit';

export type LoadingState = {
    isLoading: boolean;
    loadingMessage: string;
};

const initialState: LoadingState = {
    isLoading: false,
    loadingMessage: ''
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        showLoading: (state: LoadingState, action: { payload: string; type: string }) => {
            state.isLoading = true;
            state.loadingMessage = action.payload;
        },
        hideLoading: (state: LoadingState) => {
            state.isLoading = false;
            state.loadingMessage = '';
        }
    }
});
export const { showLoading, hideLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
