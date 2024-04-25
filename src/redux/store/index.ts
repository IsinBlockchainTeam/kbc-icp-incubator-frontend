import {combineReducers, configureStore} from "@reduxjs/toolkit";
import authReducer from "../reducers/authSlice";
import userInfoReducer from "../reducers/userInfoSlice";
import loadingReducer from "../reducers/loadingSlice";
import storage from "redux-persist/lib/storage/session";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: 'root',
  storage,
};
const rootReducer = combineReducers({
  auth: authReducer,
  userInfo: userInfoReducer,
  loading: loadingReducer
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
