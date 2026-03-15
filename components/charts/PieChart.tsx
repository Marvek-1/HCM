"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface PieChartDataPoint {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const DEFAULT_COLORS = [
  "#2578e8",
  "#00a896",
  "#e84855",
  "#f4a227",
  "#6c5ce7",
  "#009ADE",
];

export function PieChartComponent({
  data,
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 80,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
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
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ paddingLeft: "20px" }}
            iconType="circle"
          />
        )}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export default PieChartComponent;
