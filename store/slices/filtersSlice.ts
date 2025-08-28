import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DepartmentKey } from "@/types/dmart";

type Timeframe = "Today" | "Week" | "Month" | "Quarter";

type FiltersState = {
  storeId: string;
  timeframe: Timeframe;
  query: string;
  selectedDept: DepartmentKey | "All";
};

const initialState: FiltersState = {
  storeId: "all",
  timeframe: "Month",
  query: "",
  selectedDept: "All",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setStoreId: (s, a: PayloadAction<string>) => void (s.storeId = a.payload),
    setTimeframe: (s, a: PayloadAction<Timeframe>) => void (s.timeframe = a.payload),
    setQuery: (s, a: PayloadAction<string>) => void (s.query = a.payload),
    setSelectedDept: (s, a: PayloadAction<FiltersState["selectedDept"]>) =>
      void (s.selectedDept = a.payload),
    resetFilters: () => initialState,
  },
});

export const { setStoreId, setTimeframe, setQuery, setSelectedDept, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
