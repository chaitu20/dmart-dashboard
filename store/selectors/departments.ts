import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { DepartmentSnapshot } from "@/types/dmart";

export const selectFilters = (s: RootState) => s.filters;

export const selectDepartments = createSelector(
  // RTK Query keeps data under: departmentsApi.endpoints.getDepartmentSnapshots.select(args)
  [
    (_: RootState, args: { storeId: string; timeframe: any }) => args,
    (s: RootState, args: { storeId: string; timeframe: any }) =>
      s.departmentsApi.queries[
        `getDepartmentSnapshots(${JSON.stringify(args)})`
      ] as any,
  ],
  (args, queryState) => {
    const data = (queryState?.data as DepartmentSnapshot[]) ?? [];
    return data;
  }
);

export const makeSelectFiltered = () =>
  createSelector(
    [
      selectDepartments,
      (s: RootState) => s.filters.selectedDept,
      (s: RootState) => s.filters.query.trim().toLowerCase(),
    ],
    (departments, selectedDept, q) =>
      departments.filter(
        (d) =>
          (selectedDept === "All" || d.department === selectedDept) &&
          (q === "" || d.department.toLowerCase().includes(q))
      )
  );

export const makeSelectKpi = () =>
  createSelector([makeSelectFiltered()], (rows) => {
    const sum = <K extends keyof DepartmentSnapshot>(k: K) =>
      rows.reduce((acc, r) => acc + (r[k] as number), 0);

    const totalTarget = sum("targetSales");
    const totalActual = sum("actualSales");
    const avgStock = Math.round(sum("stockHealth") / Math.max(1, rows.length));
    const totalFootfall = sum("footfall");
    const avgNps = Math.round(sum("nps") / Math.max(1, rows.length));
    const totalPending = sum("ordersPending");
    const alerts = rows.flatMap((r) => r.alerts);

    return { totalTarget, totalActual, avgStock, totalFootfall, avgNps, totalPending, alerts };
  });
