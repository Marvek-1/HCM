"use client";

import React, { useEffect, useState } from "react";
import { Metadata } from "next";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { AreaChart, PieChart, LineChart } from "@/components/charts";
import { dashboardAPI, ordersAPI } from "@/lib/api";
import {
  TrendingUp,
  Package,
  AlertCircle,
  DollarSign,
} from "lucide-react";

// Sample data for charts
const orderTrendData = [
  { name: "Week 1", orders: 45, value: 12500 },
  { name: "Week 2", orders: 52, value: 15200 },
  { name: "Week 3", orders: 48, value: 13800 },
  { name: "Week 4", orders: 61, value: 18900 },
  { name: "Week 5", orders: 55, value: 16200 },
  { name: "Week 6", orders: 67, value: 20100 },
];

const commodityDistribution = [
  { name: "Vaccines", value: 35 },
  { name: "Test Kits", value: 28 },
  { name: "Medicines", value: 22 },
  { name: "Consumables", value: 15 },
];

const statusDistribution = [
  { name: "Pending", value: 15 },
  { name: "Processing", value: 8 },
  { name: "Ready", value: 12 },
  { name: "Shipped", value: 25 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalCommodities: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        if (response.success && response.data) {
          setStats({
            totalOrders: response.data.totalOrders || 0,
            pendingOrders: response.data.pendingOrders || 0,
            totalCommodities: response.data.totalCommodities || 0,
            lowStockItems: response.data.lowStockItems || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--neu-bg)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-[var(--neu-t1)] mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--neu-t3)]">
            Welcome back! Here's your operational overview.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Orders"
            value={stats.totalOrders || 0}
            icon={TrendingUp}
            color="blue"
            trend={{
              direction: "up",
              percentage: 12,
              label: "vs last month",
            }}
          />
          <MetricCard
            label="Pending Orders"
            value={stats.pendingOrders || 0}
            icon={AlertCircle}
            color="amber"
            trend={{
              direction: "down",
              percentage: 8,
              label: "vs last month",
            }}
          />
          <MetricCard
            label="Total Commodities"
            value={stats.totalCommodities || 0}
            icon={Package}
            color="green"
          />
          <MetricCard
            label="Low Stock Items"
            value={stats.lowStockItems || 0}
            icon={DollarSign}
            color="red"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Trend Chart */}
          <ChartCard
            title="Order Trends"
            subtitle="Orders and value over the last 6 weeks"
          >
            <AreaChart
              data={orderTrendData}
              dataKey="orders"
              height={300}
              color="var(--hc-blue2)"
            />
          </ChartCard>

          {/* Commodity Distribution */}
          <ChartCard
            title="Commodity Distribution"
            subtitle="Breakdown by category"
          >
            <PieChart
              data={commodityDistribution}
              height={300}
              outerRadius={80}
            />
          </ChartCard>

          {/* Order Status Distribution */}
          <ChartCard
            title="Order Status Distribution"
            subtitle="Current order status breakdown"
          >
            <PieChart
              data={statusDistribution}
              height={300}
              outerRadius={80}
              colors={[
                "var(--hc-blue)",
                "var(--hc-amber)",
                "var(--hc-green)",
                "var(--hc-purple)",
              ]}
            />
          </ChartCard>

          {/* Value Trend Chart */}
          <ChartCard
            title="Order Value Trends"
            subtitle="Total order value over time"
          >
            <LineChart
              data={orderTrendData}
              dataKeys={[
                {
                  key: "value",
                  color: "var(--hc-green)",
                  label: "Total Value",
                },
              ]}
              height={300}
            />
          </ChartCard>
        </div>

        {/* Recent Activity Section */}
        <ChartCard title="System Status" subtitle="Health and connectivity">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--hc-green-bg)]">
              <span className="text-sm font-semibold text-[var(--hc-green)]">
                Database Connection
              </span>
              <span className="text-xs font-bold text-[var(--hc-green)]">
                ✓ Active
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--hc-blue-bg)]">
              <span className="text-sm font-semibold text-[var(--hc-blue)]">
                API Server
              </span>
              <span className="text-xs font-bold text-[var(--hc-blue)]">
                ✓ Running
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--hc-blue-bg)]">
              <span className="text-sm font-semibold text-[var(--hc-blue)]">
                Cache Service
              </span>
              <span className="text-xs font-bold text-[var(--hc-blue)]">
                ✓ Operational
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </main>
  );
}
