import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userInfoReducer from '@/redux/reducers/userInfoSlice';
import loadingReducer from '@/redux/reducers/loadingSlice';
import siweIdentityReducer from '@/redux/reducers/siweIdentitySlice';
import storage from 'redux-persist/lib/storage/session';
import walletConnectReducer from '@/redux/reducers/walletConnectSlice';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage
};
const rootReducer = combineReducers({
  walletConnect: walletConnectReducer,
  userInfo: userInfoReducer,
  siweIdentity: siweIdentityReducer,
  loading: loadingReducer
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
