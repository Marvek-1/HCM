"use client";

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface LineChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  dataKeys: Array<{
    key: string;
    color?: string;
    label?: string;
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function LineChartComponent({
  data,
  dataKeys,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        )}
        <XAxis dataKey="name" stroke="var(--neu-t3)" />
        <YAxis stroke="var(--neu-t3)" />
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
            iconType="circle"
          />
        )}
        {dataKeys.map((item) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            stroke={item.color || "#2578e8"}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
            name={item.label || item.key}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export default LineChartComponent;
