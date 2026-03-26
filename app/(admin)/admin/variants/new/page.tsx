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
interface SimpleProduct { id: string; name: string; category_id: string | null; environment: 'indoor' | 'outdoor' | null; }

export default function NewVariantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [environment, setEnvironment] = useState('');
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    Promise.all([
      supabase.from('product_categories').select('id, name').order('sort_order'),
      supabase.from('products').select('id, name, category_id, environment').order('sort_order'),
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
    const code = formData.get('code') as string;
    const slug = slugify(code);

    const effectiveCategoryId = selectedProductId
      ? (selectedProduct?.category_id ?? categoryId) || null
      : categoryId || null;
    const effectiveEnvironment = selectedProductId
      ? (selectedProduct?.environment ?? environment) || null
      : environment || null;

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase not configured');

      const { error: insertError, data } = await supabase
        .from('product_variants')
        .insert({
          name: code,
          code,
          slug,
          category_id: effectiveCategoryId,
          environment: effectiveEnvironment,
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

            <Input label="Code / SKU" name="code" type="text" required placeholder="e.g., AR-DL-FX-001" />



            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product</label>
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
                  value={selectedProductId ? selectedProduct?.category_id || '' : categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={Boolean(selectedProductId)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {selectedProductId && (
                  <p className="text-xs text-gray-500">
                    Inherited from the selected product.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <select
                value={selectedProductId ? selectedProduct?.environment || '' : environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={Boolean(selectedProductId)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
              {selectedProductId && (
                <p className="text-xs text-gray-500">
                  Inherited from the selected product.
                </p>
              )}
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
