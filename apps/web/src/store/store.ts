import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './base-api';

// Store جديد لكل Request على السيرفر، وواحد بس في المتصفح (StoreProvider)
export const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
