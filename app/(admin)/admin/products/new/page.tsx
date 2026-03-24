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

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<SimpleCategory[]>([]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from('product_categories')
      .select('id, name')
      .order('sort_order')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const description = (formData.get('description') as string || '').trim();
    const categoryId = (formData.get('category_id') as string) || null;
    const slug = slugify(name);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase not configured');

      const { data: maxOrder } = await supabase
        .from('products')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrder?.sort_order ?? 0) + 1;

      const { error: insertError, data } = await supabase
        .from('products')
        .insert({ name, slug, description, category_id: categoryId, sort_order: nextOrder })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }

      router.push(`/admin/products/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Product Families
        </Link>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Add New Product Family
        </h1>
        <p className="text-gray-600">Create a new product family</p>
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Family Name"
            name="name"
            type="text"
            required
            placeholder="e.g., Laser Blade L"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category_id"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Brief description of this product family"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 text-gray-900"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Family'}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            After creating the family, you can upload images and add variants.
          </p>
        </form>
      </div>
    </div>
  );
}
