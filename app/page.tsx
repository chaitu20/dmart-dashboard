import React from "react";
import DmartDepartmentDashboard from "@/components/DmartDashboard";


export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1400px] py-6">
        <DmartDepartmentDashboard />
      </div>
    </main>
  );
}