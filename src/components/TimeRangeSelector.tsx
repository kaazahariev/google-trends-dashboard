"use client";

import { TIME_RANGES } from "@/lib/constants";
import type { TimeRange } from "@/types/trends";

interface Props {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TimeRange)}
      className="h-[44px] rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {TIME_RANGES.map((range) => (
        <option key={range.value} value={range.value}>
          {range.label}
        </option>
      ))}
    </select>
  );
}
