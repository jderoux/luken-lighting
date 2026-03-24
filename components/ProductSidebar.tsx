'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useTransition } from 'react';
import { ChevronDown, X, SlidersHorizontal, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/lib/types';

interface CategoryWithCount extends ProductCategory {
  productCount: number;
}

interface ProductSidebarProps {
  categories: CategoryWithCount[];
  totalProducts: number;
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium uppercase tracking-wider text-gray-900"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'mt-3 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SidebarContent({ categories, totalProducts }: ProductSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/products');
    });
  }, [router, startTransition]);

  const hasActiveFilters = currentCategory || currentSearch;

  return (
    <div className={cn('space-y-0', isPending && 'opacity-60 pointer-events-none')}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search products..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value;
              const timeout = setTimeout(() => updateFilter('search', value), 400);
              return () => clearTimeout(timeout);
            }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <CollapsibleSection title="Category">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateFilter('category', '')}
                className={cn(
                  'flex w-full items-center justify-between py-1.5 text-sm transition-colors',
                  !currentCategory
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <span>All Products</span>
                <span className="text-xs text-gray-400">{totalProducts}</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateFilter('category', cat.slug)}
                  className={cn(
                    'flex w-full items-center justify-between py-1.5 text-sm transition-colors',
                    currentCategory === cat.slug
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
}

export function ProductSidebar(props: ProductSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm uppercase tracking-wide text-gray-700 hover:border-gray-900 transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 pr-8">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest">
                  Filters
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
