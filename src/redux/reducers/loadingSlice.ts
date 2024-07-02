import { createSlice } from '@reduxjs/toolkit';

export type LoadingState = {
    isLoading: boolean;
    loadingMessage: string;
    loadingMessages: string[];
};

const initialState: LoadingState = {
    isLoading: false,
    loadingMessage: '',
    loadingMessages: []
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        addLoadingMessage: (state: LoadingState, action: { payload: string; type: string }) => {
            state.isLoading = true;
            state.loadingMessages.push(action.payload);
        },
        removeLoadingMessage: (state: LoadingState, action: { payload: string; type: string }) => {
            state.loadingMessages = state.loadingMessages.filter((msg) => msg !== action.payload);
            if (state.loadingMessages.length === 0) {
                state.isLoading = false;
            }
        },
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
export const { addLoadingMessage, removeLoadingMessage, showLoading, hideLoading } =
    loadingSlice.actions;
export default loadingSlice.reducer;
