import { createClient } from '@/lib/supabase/server';
import type { SiteImage } from '@/lib/types';

export async function getSiteImages(): Promise<Record<string, SiteImage>> {
  const supabase = await createClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from('site_images')
    .select('*')
    .order('sort_order');

  if (!data) return {};

  return data.reduce<Record<string, SiteImage>>((acc, img) => {
    acc[img.key] = img;
    return acc;
  }, {});
}

export async function getSiteImage(key: string): Promise<SiteImage | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('site_images')
    .select('*')
    .eq('key', key)
    .single();

  return data ?? null;
}
