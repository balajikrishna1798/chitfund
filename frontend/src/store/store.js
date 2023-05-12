import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import storage from 'redux-persist/lib/storage';
import { ShareTypeApi } from "../service/ShareTypeApi";
import authReducer from "../features/authSlice";
import { KycApi } from "../service/KycApi";
import { DepositApi } from "../service/DepositApi";
import { LoanApi } from "../service/LoanApi";
import { ShareholderApi } from "../service/ShareholderApi";

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
    [ShareTypeApi.reducerPath]: ShareTypeApi.reducer,
    [KycApi.reducerPath]: KycApi.reducer,
    [DepositApi.reducerPath]: DepositApi.reducer,
    [LoanApi.reducerPath]: LoanApi.reducer,
    [ShareholderApi.reducerPath]: ShareholderApi.reducer,
}),
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(ShareTypeApi.middleware,KycApi.middleware,DepositApi.middleware,LoanApi.middleware,ShareholderApi.middleware),
});
export const persister = persistStore(store);

setupListeners(store.dispatch)



export default store;
