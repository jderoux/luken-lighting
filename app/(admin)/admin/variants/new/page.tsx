'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SimpleCategory { id: string; name: string; }
interface SimpleProduct { id: string; name: string; category_id: string | null; }

export default function NewVariantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    Promise.all([
      supabase.from('product_categories').select('id, name').order('sort_order'),
      supabase.from('products').select('id, name, category_id').order('sort_order'),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data ?? []);
      setProducts(prodRes.data ?? []);
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = slugify(name);

    const effectiveCategoryId = selectedProductId
      ? (products.find((p) => p.id === selectedProductId)?.category_id ?? categoryId) || null
      : categoryId || null;

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase not configured');

      const { error: insertError, data } = await supabase
        .from('product_variants')
        .insert({
          name,
          code: formData.get('code') as string,
          slug,
          short_description: formData.get('short_description') as string,
          long_description: formData.get('long_description') as string || '',
          category_id: effectiveCategoryId,
          product_id: selectedProductId || null,
          manufacturer: formData.get('manufacturer') as string || null,
          manufacturer_sku: formData.get('manufacturer_sku') as string || null,
          cost_usd: formData.get('cost_usd') ? Number(formData.get('cost_usd')) : null,
          distributor_price: formData.get('distributor_price') ? Number(formData.get('distributor_price')) : null,
          is_active: formData.get('is_active') === 'on',
          is_featured: formData.get('is_featured') === 'on',
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }

      router.push(`/admin/variants/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/variants"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Variants
        </Link>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Add New Variant
        </h1>
        <p className="text-gray-600">Create a new product variant entry</p>
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
              Basic Information
            </h2>

            <Input label="Variant Name" name="name" type="text" required placeholder="e.g., Aria Downlight Fixed" />
            <Input label="Code / SKU" name="code" type="text" required placeholder="e.g., AR-DL-FX-001" />

            <div className="space-y-2">
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <textarea
                id="short_description"
                name="short_description"
                rows={3}
                required
                placeholder="Brief description (shown in listings)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="long_description" className="block text-sm font-medium text-gray-700">
                Long Description
              </label>
              <textarea
                id="long_description"
                name="long_description"
                rows={6}
                placeholder="Detailed description (shown on detail page)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Family</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">— None —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
              Manufacturer & Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Manufacturer" name="manufacturer" type="text" placeholder="e.g. Factory name" />
              <Input label="Manufacturer SKU" name="manufacturer_sku" type="text" placeholder="Factory product code" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Cost USD" name="cost_usd" type="number" step="0.01" min="0" placeholder="0.00" />
              <Input label="Distributor Price USD" name="distributor_price" type="number" step="0.01" min="0" placeholder="0.00" />
            </div>
            <p className="text-xs text-gray-500 -mt-4">
              MSRP is always 2x the distributor price. You can refine margin and pricing on the edit page.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">Status</h2>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" name="is_active" defaultChecked className="w-4 h-4" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (visible on public site)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_featured" name="is_featured" className="w-4 h-4" />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Featured (shown on homepage)</label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Variant'}
            </Button>
            <Link href="/admin/variants">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            After creating the variant, you can add technical specifications, images, and other details.
          </p>
        </form>
      </div>
    </div>
  );
}
