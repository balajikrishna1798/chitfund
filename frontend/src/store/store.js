import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import storage from 'redux-persist/lib/storage';
import { api } from "../service/Api";
import authReducer from "../features/authSlice";

const store = configureStore({
  reducer: combineReducers({
    auth: persistReducer(
        {
            key: 'account',
            storage,
            keyPrefix: 'mstar-'
        },
        authReducer,
    ),
    [api.reducerPath]: api.reducer,
}),
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
});
export const persister = persistStore(store);

setupListeners(store.dispatch)



export default store;
