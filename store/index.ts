import { configureStore } from "@reduxjs/toolkit";
import { departmentsApi } from "./services/departmentsApi";
import filtersReducer from "./slices/filtersSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    filters: filtersReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(departmentsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
