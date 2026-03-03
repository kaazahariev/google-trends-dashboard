import type { TimeRangeOption, Country } from "@/types/trends";

export const TIME_RANGES: TimeRangeOption[] = [
  {
    label: "Past hour",
    value: "past_hour",
    getStartTime: () => new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    label: "Past 4 hours",
    value: "past_4_hours",
    getStartTime: () => new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    label: "Past day",
    value: "past_day",
    getStartTime: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    label: "Past 7 days",
    value: "past_7_days",
    getStartTime: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    label: "Past 30 days",
    value: "past_30_days",
    getStartTime: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    label: "Past 90 days",
    value: "past_90_days",
    getStartTime: () => new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    label: "Past 12 months",
    value: "past_12_months",
    getStartTime: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      return d;
    },
  },
  {
    label: "Past 5 years",
    value: "past_5_years",
    getStartTime: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 5);
      return d;
    },
  },
];

export function getTimeRangeStart(value: string): Date {
  const range = TIME_RANGES.find((r) => r.value === value);
  return range ? range.getStartTime() : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
}

export const CHART_COLORS = [
  "#4285F4",
  "#EA4335",
  "#FBBC04",
  "#34A853",
  "#FF6D01",
];

export const COUNTRIES: Country[] = [
  { code: "", name: "Worldwide" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "KR", name: "South Korea" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "RU", name: "Russia" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "TW", name: "Taiwan" },
  { code: "HK", name: "Hong Kong" },
  { code: "IL", name: "Israel" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Turkey" },
];
