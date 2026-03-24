import { createClient } from '@/lib/supabase/server';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import type { ProductCategory } from '@/lib/types';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Categories
          </h1>
          <p className="text-gray-600">
            Manage product categories
          </p>
        </div>
        <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-800">
          <p className="font-medium">Supabase not configured</p>
          <p className="text-sm mt-1">
            Configure your Supabase environment variables to manage categories.
          </p>
        </div>
      </div>
    );
  }

  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order');

  return (
    <CategoriesManager initialCategories={(categories ?? []) as ProductCategory[]} />
  );
}
