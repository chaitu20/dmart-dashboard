import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function KpiCard({
  title,
  icon,
  primary,
  secondary,
  progress,
}: {
  title: string;
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  progress?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{primary}</div>
        {secondary && (
          <div className="text-xs text-muted-foreground mt-1">{secondary}</div>
        )}
        {typeof progress === "number" && (
          <div className="mt-3">
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
