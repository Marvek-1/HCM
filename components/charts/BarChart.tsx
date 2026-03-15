"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  dataKey: string;
  height?: number;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  layout?: "vertical" | "horizontal";
}

export function BarChartComponent({
  data,
  dataKey,
  height = 300,
  color = "#2578e8",
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  layout = "vertical",
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.05)"
            {...(layout === "vertical" ? { vertical: false } : {})}
          />
        )}
        <XAxis type={layout === "vertical" ? "number" : "category"} stroke="var(--neu-t3)" />
        <YAxis dataKey="name" type={layout === "vertical" ? "category" : "number"} stroke="var(--neu-t3)" />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--neu-bg)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              boxShadow:
                "2px 2px 5px rgba(0,0,0,0.1), -2px -2px 5px rgba(255,255,255,0.5)",
            }}
          />
        )}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="square"
          />
        )}
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[0, 8, 8, 0]}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default BarChartComponent;
