"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface AreaChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  dataKey: string;
  height?: number;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function AreaChartComponent({
  data,
  dataKey,
  height = 300,
  color = "#2578e8",
  showLegend = true,
  showGrid = true,
  showTooltip = true,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
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
            cursor={{ stroke: color, strokeWidth: 1 }}
          />
        )}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
        )}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
          animationDuration={600}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export default AreaChartComponent;
