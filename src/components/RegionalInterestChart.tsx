"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { CHART_COLORS } from "@/lib/constants";
import type { RegionChartData } from "@/types/trends";

interface Props {
  data: RegionChartData[];
  keywords: string[];
}

export function RegionalInterestChart({ data, keywords }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">Interest by Region</h3>
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          No regional data available
        </p>
      </div>
    );
  }

  const chartHeight = Math.max(400, data.length * 32);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">Interest by Region</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="region"
            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: isDark ? "#f3f4f6" : "#111827",
            }}
          />
          <Legend />
          {keywords.map((keyword, index) => (
            <Bar
              key={keyword}
              dataKey={keyword}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
