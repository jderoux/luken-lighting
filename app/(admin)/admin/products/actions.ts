'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const slug = slugify(name);

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return { error: `A product with slug "${slug}" already exists` };

  const { data: maxOrder } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? 0) + 1;
  const category_id = (formData.get('category_id') as string) || null;
  const environment = (formData.get('environment') as string) || null;

  const { error, data } = await supabase
    .from('products')
    .insert({ name, slug, description, category_id, environment, sort_order: nextOrder })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true, product: data };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const slug = formData.get('slug') as string;

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single();

  if (existing) return { error: `Another product with slug "${slug}" already exists` };

  const category_id = (formData.get('category_id') as string) || null;
  const environment = (formData.get('environment') as string) || null;
  const hero_image_url = (formData.get('hero_image_url') as string)?.trim() || null;
  const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || null;

  const { error } = await supabase
    .from('products')
    .update({ name, slug, description, category_id, environment, hero_image_url, thumbnail_url })
    .eq('id', id);

  if (!error) {
    const { error: variantSyncError } = await supabase
      .from('product_variants')
      .update({ environment })
      .eq('product_id', id);
    if (variantSyncError) return { error: variantSyncError.message };
  }

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: variants } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', id)
    .limit(1);

  if (variants && variants.length > 0) {
    return { error: 'Cannot delete: this product has variants assigned to it. Remove or reassign them first.' };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductSortOrder(orderedIds: string[]) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const updates = orderedIds.map((id, i) =>
    supabase.from('products').update({ sort_order: i + 1 }).eq('id', id)
  );
  await Promise.all(updates);

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}
