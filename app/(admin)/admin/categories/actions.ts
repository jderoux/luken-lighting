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

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const slug = slugify(name);

  const { data: existing } = await supabase
    .from('product_categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return { error: `A category with slug "${slug}" already exists` };

  const { data: maxOrder } = await supabase
    .from('product_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? 0) + 1;

  const { error, data } = await supabase
    .from('product_categories')
    .insert({ name, slug, description, sort_order: nextOrder })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true, category: data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const slug = formData.get('slug') as string;

  const { data: existing } = await supabase
    .from('product_categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single();

  if (existing) return { error: `Another category with slug "${slug}" already exists` };

  const { error } = await supabase
    .from('product_categories')
    .update({ name, slug, description })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (products && products.length > 0) {
    return { error: 'Cannot delete: this category has products assigned to it. Remove or reassign them first.' };
  }

  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/admin/images');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategorySortOrder(orderedIds: string[]) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const updates = orderedIds.map((id, i) =>
    supabase.from('product_categories').update({ sort_order: i + 1 }).eq('id', id)
  );
  await Promise.all(updates);

  revalidatePath('/admin/categories');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}
