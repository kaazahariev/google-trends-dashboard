"use client";

import { COUNTRIES } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function RegionSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[44px] rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
