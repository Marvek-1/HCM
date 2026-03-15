"use client";

import React, { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actionButton?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  actionButton,
}: ChartCardProps) {
  return (
    <div className={`neu-flat p-6 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold" style={{ color: "var(--neu-t1)" }}>
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--neu-t3)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actionButton}
      </div>

      {/* Content */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
