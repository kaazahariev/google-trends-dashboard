"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { CHART_COLORS } from "@/lib/constants";
import type { ChartDataPoint } from "@/types/trends";

interface Props {
  data: ChartDataPoint[];
  keywords: string[];
}

export function InterestOverTimeChart({ data, keywords }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">Interest Over Time</h3>
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          No data available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">Interest Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: isDark ? "#4b5563" : "#d1d5db" }}
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
            <Line
              key={keyword}
              type="monotone"
              dataKey={keyword}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
