"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage: number;
    label: string;
  };
  color?: "blue" | "green" | "red" | "amber" | "purple";
  className?: string;
}

const colorMap = {
  blue: {
    bg: "var(--hc-blue-bg)",
    text: "var(--hc-blue)",
    border: "#e0f1ff",
  },
  green: {
    bg: "var(--hc-green-bg)",
    text: "var(--hc-green)",
    border: "#d4f4f1",
  },
  red: {
    bg: "var(--hc-red-bg)",
    text: "var(--hc-red)",
    border: "#ffe8eb",
  },
  amber: {
    bg: "var(--hc-amber-bg)",
    text: "var(--hc-amber)",
    border: "#fff4d9",
  },
  purple: {
    bg: "var(--hc-purple-bg)",
    text: "var(--hc-purple)",
    border: "#f0e8ff",
  },
};

const trendColorMap = {
  up: "var(--hc-green)",
  down: "var(--hc-red)",
  neutral: "var(--neu-t3)",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
  className = "",
}: MetricCardProps) {
  const colors = colorMap[color];
  const trendColor = trend ? trendColorMap[trend.direction] : undefined;

  return (
    <div
      className={`neu-flat p-6 min-h-[140px] flex flex-col justify-between group hover:shadow-neu-md transition-all duration-300 ${className}`}
      style={{ "--neu-bg": "var(--neu-bg)" } as React.CSSProperties}
    >
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--neu-t3)" }}
          >
            {label}
          </p>
        </div>
        {Icon && (
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-4">
        <p
          className="text-3xl font-bold font-variant-numeric tabular-nums"
          style={{ color: "var(--neu-t1)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span style={{ color: trendColor }}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
            {trend.percentage}%
          </span>
          <span style={{ color: "var(--neu-t3)" }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
