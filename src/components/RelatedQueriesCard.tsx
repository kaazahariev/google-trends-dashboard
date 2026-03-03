"use client";

import { useState } from "react";
import type { ParsedRelatedQueries } from "@/types/trends";
import { CHART_COLORS } from "@/lib/constants";

interface Props {
  data: Record<string, ParsedRelatedQueries>;
  keywords: string[];
}

export function RelatedQueriesCard({ data, keywords }: Props) {
  const [tab, setTab] = useState<"top" | "rising">("top");

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold">Related Queries</h3>
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          No related queries available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">Related Queries</h3>
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setTab("top")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "top"
              ? "bg-white shadow-sm dark:bg-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Top
        </button>
        <button
          onClick={() => setTab("rising")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "rising"
              ? "bg-white shadow-sm dark:bg-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Rising
        </button>
      </div>

      <div className="max-h-[400px] space-y-4 overflow-y-auto">
        {keywords.map((keyword, ki) => {
          const queries = data[keyword]?.[tab] || [];
          if (queries.length === 0) return null;

          return (
            <div key={keyword}>
              {keywords.length > 1 && (
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: CHART_COLORS[ki % CHART_COLORS.length] }}
                >
                  {keyword}
                </p>
              )}
              <div className="space-y-1.5">
                {queries.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 shrink-0 text-right text-xs text-gray-400">
                      {i + 1}
                    </span>
                    <div className="flex-1 truncate">{q.query}</div>
                    {tab === "top" ? (
                      <div className="flex w-24 items-center gap-1">
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${q.value}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-gray-500">
                          {q.value}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          q.formattedValue === "Breakout"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                      >
                        {q.formattedValue}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
