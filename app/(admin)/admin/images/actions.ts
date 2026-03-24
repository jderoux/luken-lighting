'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const STORAGE_BUCKET = 'site-images';

function extractStoragePath(fileUrl: string): string | null {
  if (!fileUrl.includes('/storage/v1/object/public/')) return null;
  const parts = fileUrl.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
  return parts[1] ? decodeURIComponent(parts[1]) : null;
}

export async function updateSiteImage(
  key: string,
  imageUrl: string,
  altText: string
) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error, data } = await supabase
    .from('site_images')
    .update({ image_url: imageUrl, alt_text: altText })
    .eq('key', key)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: 'Update blocked — check database permissions.' };
  }

  revalidatePath('/admin/images');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/professionals');
  return { success: true };
}

export async function updateSiteImageAltText(key: string, altText: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('site_images')
    .update({ alt_text: altText })
    .eq('key', key);

  if (error) return { error: error.message };

  revalidatePath('/admin/images');
  return { success: true };
}

export async function deleteSiteImage(key: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: current } = await supabase
    .from('site_images')
    .select('image_url')
    .eq('key', key)
    .single();

  if (current?.image_url) {
    const storagePath = extractStoragePath(current.image_url);
    if (storagePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from('site_images')
    .update({ image_url: null, alt_text: null })
    .eq('key', key);

  if (error) return { error: error.message };

  revalidatePath('/admin/images');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/professionals');
  return { success: true };
}

type EntityTable = 'product_categories' | 'products' | 'inspiration_projects';

const ALLOWED_TABLES: EntityTable[] = [
  'product_categories',
  'products',
  'inspiration_projects',
];

type ImageField = 'hero_image_url' | 'thumbnail_url';

const ALLOWED_FIELDS: ImageField[] = ['hero_image_url', 'thumbnail_url'];

function revalidateEntityPaths() {
  revalidatePath('/admin/images');
  revalidatePath('/');
  revalidatePath('/inspiration');
  revalidatePath('/products');
}

export async function updateEntityImage(
  table: string,
  entityId: string,
  field: string,
  imageUrl: string
) {
  if (!ALLOWED_TABLES.includes(table as EntityTable)) {
    return { error: 'Invalid table' };
  }
  if (!ALLOWED_FIELDS.includes(field as ImageField)) {
    return { error: 'Invalid field' };
  }

  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error, data } = await supabase
    .from(table)
    .update({ [field]: imageUrl })
    .eq('id', entityId)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: 'Update blocked — check database permissions.' };
  }

  revalidateEntityPaths();
  return { success: true };
}

export async function deleteEntityImage(
  table: string,
  entityId: string,
  field: string
) {
  if (!ALLOWED_TABLES.includes(table as EntityTable)) {
    return { error: 'Invalid table' };
  }
  if (!ALLOWED_FIELDS.includes(field as ImageField)) {
    return { error: 'Invalid field' };
  }

  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: current } = await supabase
    .from(table)
    .select(field)
    .eq('id', entityId)
    .single();

  const currentRecord = current as Record<string, string | null> | null;
  const currentValue = currentRecord?.[field];

  if (currentValue) {
    const storagePath = extractStoragePath(currentValue);
    if (storagePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from(table)
    .update({ [field]: null })
    .eq('id', entityId);

  if (error) return { error: error.message };

  revalidateEntityPaths();
  return { success: true };
}

// Keep old names as aliases for backward compatibility
export const updateEntityHeroImage = (table: string, entityId: string, imageUrl: string) =>
  updateEntityImage(table, entityId, 'hero_image_url', imageUrl);

export const deleteEntityHeroImage = (table: string, entityId: string) =>
  deleteEntityImage(table, entityId, 'hero_image_url');
