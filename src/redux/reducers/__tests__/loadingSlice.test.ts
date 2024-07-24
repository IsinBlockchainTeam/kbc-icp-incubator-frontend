import loadingReducer, {
    removeLoadingMessage,
    LoadingState,
    addLoadingMessage
} from '@/redux/reducers/loadingSlice';

describe('loadingSlice', () => {
    test('should update state for adding a loading message', () => {
        const initialState: LoadingState = {
            isLoading: false,
            loadingMessages: []
        };
        const action = addLoadingMessage('loading message');
        const nextState = loadingReducer(initialState, action);

        expect(nextState.isLoading).toBe(true);
        expect(nextState.loadingMessages).toStrictEqual(['loading message']);
    });
    test('should update state for hiding loading', () => {
        const initialState: LoadingState = {
            isLoading: true,
            loadingMessages: ['loading message']
        };
        const action = removeLoadingMessage('loading message');
        const nextState = loadingReducer(initialState, action);

        expect(nextState.isLoading).toBe(false);
        expect(nextState.loadingMessages).toStrictEqual([]);
    });
});
