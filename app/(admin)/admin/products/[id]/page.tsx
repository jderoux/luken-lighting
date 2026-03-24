import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductFamilyEditForm } from '@/components/admin/ProductFamilyEditForm';
import type { Product, ProductCategory } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return <p className="text-red-600">Supabase not configured.</p>;
  }

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_categories').select('*').order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <ProductFamilyEditForm
      product={product as Product}
      categories={(categories ?? []) as ProductCategory[]}
    />
  );
}
