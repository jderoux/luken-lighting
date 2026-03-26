'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  options: string[];
  values?: string[];
  current?: string;
  baseUrl: string;
  filterKey: string;
  allFilters: Record<string, string | undefined>;
}

function buildFilterUrl(
  base: string,
  current: Record<string, string | undefined>,
  key: string,
  value: string | null
) {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries(current)) {
    if (v && k !== key) next[k] = v;
  }
  if (value) next[key] = value;
  const q = new URLSearchParams(next).toString();
  return q ? `${base}?${q}` : base;
}

export function FilterDropdown({
  label,
  options,
  values,
  current,
  baseUrl,
  filterKey,
  allFilters,
}: FilterDropdownProps) {
  const router = useRouter();
  const actualValues = values || options;

  return (
    <div className="relative flex-shrink-0">
      <label className="absolute -top-2 left-3 bg-gray-50 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 z-10">
        {label}
      </label>
      <select
        value={current || ''}
        onChange={(e) => {
          const val = e.target.value || null;
          router.push(buildFilterUrl(baseUrl, allFilters, filterKey, val));
        }}
        className="appearance-none pl-4 pr-8 py-2.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-[140px]"
      >
        <option value="">All</option>
        {options.map((opt, i) => (
          <option key={opt} value={actualValues[i]}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}
