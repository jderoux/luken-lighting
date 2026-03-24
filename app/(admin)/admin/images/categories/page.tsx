import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EntityImageCard } from '@/components/admin/EntityImageCard';
import { ArrowLeft } from 'lucide-react';
import type { ProductCategory } from '@/lib/types';

export default async function CmsCategoriesPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Category Images
          </h1>
          <p className="text-gray-600">Supabase not configured</p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order');

  const categories = (data ?? []) as ProductCategory[];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/images"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CMS
        </Link>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Category Images
        </h1>
        <p className="text-gray-600">
          Hero images for product categories displayed on the homepage and category pages
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <EntityImageCard
              key={cat.id}
              table="product_categories"
              entityId={cat.id}
              entityName={cat.name}
              currentImageUrl={cat.hero_image_url}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 border border-gray-200 text-gray-500 text-sm">
          No categories found. Create categories first in the{' '}
          <Link href="/admin/categories" className="underline hover:text-gray-900">
            Categories
          </Link>{' '}
          section.
        </div>
      )}
    </div>
  );
}
