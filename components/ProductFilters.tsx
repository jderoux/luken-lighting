'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/Input';
import { ProductCategory } from '@/lib/types';
import { ALL_CONTROL_TYPES, CONTROL_TYPE_LABELS } from '@/lib/types';

interface ProductFiltersProps {
  categories: ProductCategory[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const currentCategory = searchParams.get('category') || '';
  const currentIpRating = searchParams.get('ip_rating') || '';
  const currentMountingType = searchParams.get('mounting_type') || '';
  const currentControlType = searchParams.get('control_type') || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-wide"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div>
        <Input
          type="search"
          placeholder="Search products..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => {
            const value = e.target.value;
            setTimeout(() => updateFilter('search', value), 500);
          }}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mounting Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mounting Type
        </label>
        <select
          value={currentMountingType}
          onChange={(e) => updateFilter('mounting_type', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="recessed">Recessed</option>
          <option value="surface">Surface</option>
          <option value="pendant">Pendant</option>
          <option value="wall">Wall</option>
          <option value="track">Track</option>
        </select>
      </div>

      {/* IP Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IP Rating
        </label>
        <select
          value={currentIpRating}
          onChange={(e) => updateFilter('ip_rating', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Ratings</option>
          <option value="IP20">IP20</option>
          <option value="IP44">IP44</option>
          <option value="IP54">IP54</option>
          <option value="IP65">IP65</option>
          <option value="IP67">IP67</option>
          <option value="IP68">IP68</option>
        </select>
      </div>

      {/* Control Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Control Type
        </label>
        <select
          value={currentControlType}
          onChange={(e) => updateFilter('control_type', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">All Controls</option>
          {ALL_CONTROL_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {CONTROL_TYPE_LABELS[ct]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
