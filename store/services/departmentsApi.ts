import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DepartmentKey, DepartmentSnapshot } from "@/types/dmart";
import { rand } from "../../utils";

// ---- Mock generator (same logic you had) ----
const DEPARTMENTS: DepartmentKey[] = [
  "Grocery",
  "Fruits & Vegetables",
  "Dairy",
  "Frozen",
  "FMCG",
  "Personal Care",
  "Household",
  "Electronics",
];

function genSalesTrend(days = 30, base = 100000) {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      sales: Math.max(0, Math.round(base * (0.8 + Math.random() * 0.6))),
    };
  });
}

function genDepartmentSnapshot(dept: DepartmentKey): DepartmentSnapshot {
  const base: Record<DepartmentKey, number> = {
    Grocery: 14,
    "Fruits & Vegetables": 7,
    Dairy: 6,
    Frozen: 5,
    FMCG: 10,
    "Personal Care": 8,
    Household: 9,
    Electronics: 20,
  };
  const targetSales = base[dept] * 1_00_000;
  const actualSales = Math.round(targetSales * (0.8 + Math.random() * 0.5));
  const alerts: DepartmentSnapshot["alerts"] = [];
  if (Math.random() < 0.4) alerts.push({ id: crypto.randomUUID(), severity: "high", message: "Critical OOS on top SKU." });
  if (Math.random() < 0.5) alerts.push({ id: crypto.randomUUID(), severity: "medium", message: "Negative NPS comments spiking." });
  if (Math.random() < 0.6) alerts.push({ id: crypto.randomUUID(), severity: "low", message: "Replenishment slightly delayed." });

  return {
    department: dept,
    targetSales,
    actualSales,
    stockHealth: rand(60, 98),
    footfall: rand(800, 5000),
    nps: rand(20, 85),
    ordersPending: rand(0, 35),
    shrinkageRate: rand(1, 6),
    onTimeReplenishment: rand(70, 99),
    lastUpdated: new Date().toISOString(),
    alerts,
    salesTrend: genSalesTrend(30, targetSales / 30),
    topSKUs: Array.from({ length: 5 }).map((_, i) => ({
      sku: `${dept.slice(0, 3).toUpperCase()}-${100 + i}`,
      name: `${dept} Product ${i + 1}`,
      qtySold: rand(200, 2000),
      revenue: rand(50_000, 3_00_000),
    })),
  };
}

// ---- API ----
export const departmentsApi = createApi({
  reducerPath: "departmentsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // fine to keep, unused by queryFn
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getDepartmentSnapshots: builder.query<
      DepartmentSnapshot[],
      { storeId: string; timeframe: "Today" | "Week" | "Month" | "Quarter" }
    >({
      // ✅ use queryFn, no transformResponse here
      async queryFn({ storeId, timeframe }) {
        await new Promise((r) => setTimeout(r, 200)); // simulate latency
        const data = DEPARTMENTS.map((d) => genDepartmentSnapshot(d));
        return { data };
      },
    }),
  }),
});

export const { useGetDepartmentSnapshotsQuery } = departmentsApi;
