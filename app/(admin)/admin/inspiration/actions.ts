'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const STORAGE_BUCKET = 'site-images';

function extractStoragePath(fileUrl: string): string | null {
  if (!fileUrl.includes('/storage/v1/object/public/')) return null;
  const parts = fileUrl.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
  return parts[1] ? decodeURIComponent(parts[1]) : null;
}

function revalidateProjectPaths(projectId?: string) {
  revalidatePath('/admin/inspiration');
  if (projectId) revalidatePath(`/admin/inspiration/${projectId}`);
  revalidatePath('/admin/images');
  revalidatePath('/inspiration');
  revalidatePath('/');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const location = (formData.get('location') as string) || null;
  const yearStr = formData.get('year') as string;
  const year = yearStr ? Number(yearStr) : null;
  const architect = (formData.get('architect') as string) || null;
  const lighting_designer = (formData.get('lighting_designer') as string) || null;
  const client_name = (formData.get('client_name') as string) || null;
  const photographer = (formData.get('photographer') as string) || null;
  const slug = slugify(name);

  const { data: existing } = await supabase
    .from('inspiration_projects')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return { error: `A project with slug "${slug}" already exists` };

  const { data: maxOrder } = await supabase
    .from('inspiration_projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? 0) + 1;

  const { error, data } = await supabase
    .from('inspiration_projects')
    .insert({ name, slug, description, location, year, architect, lighting_designer, client_name, photographer, sort_order: nextOrder })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateProjectPaths(data.id);
  return { success: true, project: data };
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const slug = formData.get('slug') as string;
  const location = (formData.get('location') as string) || null;
  const yearStr = formData.get('year') as string;
  const year = yearStr ? Number(yearStr) : null;
  const architect = (formData.get('architect') as string) || null;
  const lighting_designer = (formData.get('lighting_designer') as string) || null;
  const client_name = (formData.get('client_name') as string) || null;
  const photographer = (formData.get('photographer') as string) || null;

  const { data: existing } = await supabase
    .from('inspiration_projects')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single();

  if (existing) return { error: `Another project with slug "${slug}" already exists` };

  const { error } = await supabase
    .from('inspiration_projects')
    .update({ name, slug, description, location, year, architect, lighting_designer, client_name, photographer })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidateProjectPaths(id);
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('inspiration_projects')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidateProjectPaths();
  return { success: true };
}

export async function updateProjectSortOrder(orderedIds: string[]) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const updates = orderedIds.map((id, i) =>
    supabase.from('inspiration_projects').update({ sort_order: i + 1 }).eq('id', id)
  );
  await Promise.all(updates);

  revalidateProjectPaths();
  return { success: true };
}

// --- Gallery image actions ---

export async function addProjectImage(
  projectId: string,
  imageUrl: string,
  caption?: string
) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: maxOrder } = await supabase
    .from('project_images')
    .select('sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? 0) + 1;

  const { error, data } = await supabase
    .from('project_images')
    .insert({
      project_id: projectId,
      image_url: imageUrl,
      caption: caption || null,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateProjectPaths(projectId);
  return { success: true, image: data };
}

export async function deleteProjectImage(imageId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: image } = await supabase
    .from('project_images')
    .select('image_url, project_id')
    .eq('id', imageId)
    .single();

  if (!image) return { error: 'Image not found' };

  const storagePath = extractStoragePath(image.image_url);
  if (storagePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from('project_images')
    .delete()
    .eq('id', imageId);

  if (error) return { error: error.message };

  revalidateProjectPaths(image.project_id);
  return { success: true };
}

// --- Product linking actions ---

export async function linkProduct(projectId: string, variantId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: existing } = await supabase
    .from('project_products')
    .select('variant_id')
    .eq('project_id', projectId)
    .eq('variant_id', variantId)
    .single();

  if (existing) return { error: 'Variant already linked' };

  const { error } = await supabase
    .from('project_products')
    .insert({ project_id: projectId, variant_id: variantId });

  if (error) return { error: error.message };

  revalidateProjectPaths(projectId);
  return { success: true };
}

export async function unlinkProduct(projectId: string, variantId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('project_products')
    .delete()
    .eq('project_id', projectId)
    .eq('variant_id', variantId);

  if (error) return { error: error.message };

  revalidateProjectPaths(projectId);
  return { success: true };
}
