import { createSlice } from '@reduxjs/toolkit';

export type LoadingState = {
    isLoading: boolean;
    loadingMessages: string[];
};

const initialState: LoadingState = {
    isLoading: false,
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
        }
    }
});
export const { addLoadingMessage, removeLoadingMessage } = loadingSlice.actions;
export default loadingSlice.reducer;
