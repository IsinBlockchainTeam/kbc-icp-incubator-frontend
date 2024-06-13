import loadingReducer, {
    hideLoading,
    LoadingState,
    showLoading
} from '@/redux/reducers/loadingSlice';

describe('loadingSlice', () => {
    test('should update state for showing loading', () => {
        const initialState: LoadingState = {
            isLoading: false,
            loadingMessage: ''
        };
        const action = showLoading('loading message');
        const nextState = loadingReducer(initialState, action);

        expect(nextState.isLoading).toBe(true);
        expect(nextState.loadingMessage).toBe('loading message');
    });
    test('should update state for hiding loading', () => {
        const initialState: LoadingState = {
            isLoading: true,
            loadingMessage: 'loading message'
        };
        const action = hideLoading();
        const nextState = loadingReducer(initialState, action);

        expect(nextState.isLoading).toBe(false);
        expect(nextState.loadingMessage).toBe('');
    });
});
