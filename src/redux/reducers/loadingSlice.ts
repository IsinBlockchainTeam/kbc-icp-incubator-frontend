import { createSlice } from '@reduxjs/toolkit';

export type LoadingState = {
    isLoading: boolean;
    loadingMessages: { [key: string]: number };
};

const initialState: LoadingState = {
    isLoading: false,
    loadingMessages: {}
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        addLoadingMessage: (state: LoadingState, action: { payload: string; type: string }) => {
            state.isLoading = true;
            const count = state.loadingMessages[action.payload] || 0;
            state.loadingMessages[action.payload] = count + 1;
        },
        removeLoadingMessage: (state: LoadingState, action: { payload: string; type: string }) => {
            let count = state.loadingMessages[action.payload];
            if (count === undefined) return;
            count--;
            state.loadingMessages[action.payload] = count;
            if (count === 0) {
                state.isLoading = false;
                state.loadingMessages = Object.fromEntries(
                    Object.entries(state.loadingMessages).filter(([key]) => key !== action.payload)
                );
            }
        }
    }
});
export const { addLoadingMessage, removeLoadingMessage } = loadingSlice.actions;
export default loadingSlice.reducer;
