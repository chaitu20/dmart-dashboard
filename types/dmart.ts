export type DepartmentKey =
  | "Grocery"
  | "Fruits & Vegetables"
  | "Dairy"
  | "Frozen"
  | "FMCG"
  | "Personal Care"
  | "Household"
  | "Electronics";

export type DepartmentSnapshot = {
  department: DepartmentKey;
  targetSales: number; // for the period
  actualSales: number; // for the period
  stockHealth: number; // 0-100
  footfall: number; // people count
  nps: number; // -100..100 mapped to 0..100 for UI
  ordersPending: number;
  shrinkageRate: number; // %
  onTimeReplenishment: number; // %
  lastUpdated: string; // ISO
  alerts: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    message: string;
  }>;
  salesTrend: Array<{ date: string; sales: number }>; // daily
  topSKUs: Array<{
    sku: string;
    name: string;
    qtySold: number;
    revenue: number;
  }>; // top 5
};

export type Store = { id: string; name: string; city: string };