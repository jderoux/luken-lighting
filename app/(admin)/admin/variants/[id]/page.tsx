import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { VariantEditForm } from '@/components/admin/VariantEditForm';
import { getSettings } from '@/app/(admin)/admin/settings/actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVariantPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return <p className="text-red-600">Supabase not configured.</p>;
  }

  const [
    { data: variant },
    { data: categories },
    { data: products },
    { data: assets },
  ] = await Promise.all([
    supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('product_categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .order('name'),
    supabase
      .from('product_assets')
      .select('*')
      .eq('variant_id', id)
      .order('type')
      .order('sort_order'),
  ]);

  if (!variant) notFound();

  const settings = await getSettings();

  return (
    <VariantEditForm
      variant={variant}
      categories={categories || []}
      products={products || []}
      assets={assets || []}
      settings={settings}
    />
  );
}
