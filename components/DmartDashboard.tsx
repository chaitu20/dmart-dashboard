"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  Users,
  Factory,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatINR, pct, rand } from "../utils";
import KpiCard from "./dashboard/KpiCard";
import Stat from "./dashboard/Stat";

// -------------------- Types --------------------

type DepartmentKey =
  | "Grocery"
  | "Fruits & Vegetables"
  | "Dairy"
  | "Frozen"
  | "FMCG"
  | "Personal Care"
  | "Household"
  | "Electronics";

type DepartmentSnapshot = {
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

type Store = { id: string; name: string; city: string };

const STORES: Store[] = [
  { id: "all", name: "All Stores", city: "India" },
  { id: "hyd-01", name: "Hyderabad - Kukatpally", city: "Hyderabad" },
  { id: "blr-02", name: "Bengaluru - Whitefield", city: "Bengaluru" },
  { id: "mum-03", name: "Mumbai - Andheri", city: "Mumbai" },
];

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
  const base = {
    Grocery: 14,
    "Fruits & Vegetables": 7,
    Dairy: 6,
    Frozen: 5,
    FMCG: 10,
    "Personal Care": 8,
    Household: 9,
    Electronics: 20,
  }[dept];

  const targetSales = base * 1_00_000; // INR
  const actualSales = Math.round(targetSales * (0.8 + Math.random() * 0.5));

  const alerts: DepartmentSnapshot["alerts"] = [];
  if (Math.random() < 0.4)
    alerts.push({
      id: crypto.randomUUID(),
      severity: "high",
      message: "Critical OOS on top SKU.",
    });
  if (Math.random() < 0.5)
    alerts.push({
      id: crypto.randomUUID(),
      severity: "medium",
      message: "Negative NPS comments spiking.",
    });
  if (Math.random() < 0.6)
    alerts.push({
      id: crypto.randomUUID(),
      severity: "low",
      message: "Replenishment slightly delayed.",
    });

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

export default function DmartDepartmentDashboard() {
  const [store, setStore] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"Today" | "Week" | "Month" | "Quarter">("Month");
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<DepartmentKey | "All">("All");

  // Mock data — regenerate when filters change (simulate fetch)
  const data = useMemo(() => DEPARTMENTS.map((d) => genDepartmentSnapshot(d)), [store, timeframe]);

  const filtered = data.filter(
    (d) => (selectedDept === "All" || d.department === selectedDept) && (query.trim() === "" || d.department.toLowerCase().includes(query.toLowerCase()))
  );

  const kpi = useMemo(() => {
    const totalTarget = filtered.reduce((s, d) => s + d.targetSales, 0);
    const totalActual = filtered.reduce((s, d) => s + d.actualSales, 0);
    const avgStock = Math.round(filtered.reduce((s, d) => s + d.stockHealth, 0) / Math.max(1, filtered.length));
    const totalFootfall = filtered.reduce((s, d) => s + d.footfall, 0);
    const avgNps = Math.round(filtered.reduce((s, d) => s + d.nps, 0) / Math.max(1, filtered.length));
    const totalPending = filtered.reduce((s, d) => s + d.ordersPending, 0);
    const alerts = filtered.flatMap((d) => d.alerts);
    return { totalTarget, totalActual, avgStock, totalFootfall, avgNps, totalPending, alerts };
  }, [filtered]);

  const deptForCharts = filtered[0] ?? data[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">DMart Department Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track performance across departments and stores in real-time.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select store" /></SelectTrigger>
              <SelectContent>
                {STORES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Timeframe" /></SelectTrigger>
              <SelectContent>
                {(["Today", "Week", "Month", "Quarter"] as const).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Select value={selectedDept} onValueChange={(v) => setSelectedDept(v as any)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search department" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Sales vs Target"
          icon={<TrendingUp className="h-5 w-5" />}
          primary={formatINR(kpi.totalActual)}
          secondary={`Target: ${formatINR(kpi.totalTarget)} (${pct(kpi.totalActual, kpi.totalTarget)}%)`}
          progress={pct(kpi.totalActual, kpi.totalTarget)}
        />
        <KpiCard title="Stock Health" icon={<Package className="h-5 w-5" />} primary={`${kpi.avgStock}%`} secondary="Weighted average across selected" progress={kpi.avgStock} />
        <KpiCard title="Footfall" icon={<Users className="h-5 w-5" />} primary={kpi.totalFootfall.toLocaleString("en-IN")} secondary={`Avg NPS: ${kpi.avgNps}`} progress={kpi.avgNps} />
        <KpiCard title="Pending Orders" icon={<ShoppingCart className="h-5 w-5" />} primary={kpi.totalPending.toLocaleString("en-IN")} secondary="Supplier POs & customer pickups" progress={Math.min(100, Math.max(0, 100 - kpi.totalPending))} />
      </div>

      {/* Alerts */}
      {kpi.alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle>Active Alerts</CardTitle>
              <Badge variant="outline" className="ml-2">{kpi.alerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {kpi.alerts.map((a) => (
              <Badge key={a.id} variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "default" : "secondary"}>
                {a.severity.toUpperCase()} · {a.message}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Layout: Left (Dept grid) + Right (Charts) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Department Cards */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <motion.div key={d.department} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDept(d.department)}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Factory className="h-4 w-4" /> {d.department}
                  </CardTitle>
                  <Badge variant={d.actualSales >= d.targetSales ? "default" : "secondary"}>{pct(d.actualSales, d.targetSales)}% of target</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Stat label="Sales" value={formatINR(d.actualSales)} />
                    <Stat label="Target" value={formatINR(d.targetSales)} />
                    <Stat label="Stock Health" value={`${d.stockHealth}%`} />
                    <Stat label="Footfall" value={d.footfall.toLocaleString("en-IN")} />
                    <Stat label="NPS" value={d.nps} />
                    <Stat label="Pending Orders" value={d.ordersPending} />
                    <Stat label="Shrinkage" value={`${d.shrinkageRate}%`} />
                    <Stat label="OT Replenishment" value={`${d.onTimeReplenishment}%`} />
                  </div>
                  <Progress value={pct(d.actualSales, d.targetSales)} />
                  {d.alerts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {d.alerts.slice(0, 2).map((a) => (
                        <Badge key={a.id} variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "default" : "secondary"}>
                          {a.severity.toUpperCase()} · {a.message}
                        </Badge>
                      ))}
                      {d.alerts.length > 2 && <Badge variant="outline">+{d.alerts.length - 2} more</Badge>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Right: Charts & Top SKUs */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{deptForCharts.department} · Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deptForCharts.salesTrend} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{deptForCharts.department} · Stock vs Orders</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Stock Health", value: deptForCharts.stockHealth },
                    { name: "On-time Repl.", value: deptForCharts.onTimeReplenishment },
                    { name: "Pending Orders", value: deptForCharts.ordersPending },
                  ]}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Metric" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{deptForCharts.department} · Top SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deptForCharts.topSKUs.map((s) => (
                  <div key={s.sku} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatINR(s.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{s.qtySold.toLocaleString("en-IN")} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deep Dive */}
      <Tabs defaultValue="matrix" className="w-full">
        <TabsList>
          <TabsTrigger value="matrix">Department Matrix</TabsTrigger>
          <TabsTrigger value="ops">Ops & Issues</TabsTrigger>
          <TabsTrigger value="config">Configure</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Department Health Matrix</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Department</th>
                    <th className="py-2">Sales</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">% to Target</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">NPS</th>
                    <th className="py-2">Pending Orders</th>
                    <th className="py-2">Shrinkage</th>
                    <th className="py-2">Replenishment</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.department} className="border-t">
                      <td className="py-2 font-medium">{d.department}</td>
                      <td className="py-2">{formatINR(d.actualSales)}</td>
                      <td className="py-2">{formatINR(d.targetSales)}</td>
                      <td className="py-2">{pct(d.actualSales, d.targetSales)}%</td>
                      <td className="py-2">{d.stockHealth}%</td>
                      <td className="py-2">{d.nps}</td>
                      <td className="py-2">{d.ordersPending}</td>
                      <td className="py-2">{d.shrinkageRate}%</td>
                      <td className="py-2">{d.onTimeReplenishment}%</td>
                      <td className="py-2">{new Date(d.lastUpdated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ops">
          <Card>
            <CardHeader>
              <CardTitle>Operational Issues & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.map((d) => (
                <div key={d.department} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{d.department}</div>
                    <div className="text-xs text-muted-foreground">Last updated: {new Date(d.lastUpdated).toLocaleString()}</div>
                  </div>
                  {d.alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No active issues.</p>
                  ) : (
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {d.alerts.map((a) => (
                        <li key={a.id} className="flex items-start gap-2">
                          <Badge className="mt-0.5" variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "default" : "secondary"}>{a.severity}</Badge>
                          <span>{a.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary">Create Task</Button>
                    <Button size="sm">Assign Owner</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configure Targets & Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((d) => (
                <div key={d.department} className="border rounded-xl p-4 space-y-3">
                  <div className="font-medium">{d.department}</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Sales Target (₹)</span>
                      <Input defaultValue={d.targetSales} type="number" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Stock Health Target (%)</span>
                      <Input defaultValue={90} type="number" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">NPS Target</span>
                      <Input defaultValue={75} type="number" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Max Pending Orders</span>
                      <Input defaultValue={10} type="number" />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">Save</Button>
                    <Button size="sm" variant="secondary">Reset</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center">Demo data for structure & layout. Replace with your APIs.</div>
    </div>
  );
}