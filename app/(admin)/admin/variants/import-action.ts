'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { calcDistributorPrice } from '@/lib/pricing';
import type { CsvVariantRow } from './import-utils';

export async function importVariants(rows: CsvVariantRow[]) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured', inserted: 0, failed: 0 };

  const { data: categories } = await supabase.from('product_categories').select('id, slug');
  const { data: products } = await supabase.from('products').select('id, slug, category_id, environment');

  const catMap = new Map((categories || []).map(c => [c.slug, c.id]));
  const prodMap = new Map((products || []).map(p => [p.slug, p.id]));
  const prodCatMap = new Map((products || []).map(p => [p.id, p.category_id]));
  const prodEnvironmentMap = new Map((products || []).map(p => [p.id, p.environment]));

  const unknownCategories: string[] = [];
  for (const row of rows) {
    const prodId = row.product_slug ? prodMap.get(row.product_slug.trim()) : null;
    if (prodId) continue;
    if (!row.category_slug?.trim() || !catMap.has(row.category_slug.trim())) {
      unknownCategories.push(row.category_slug?.trim() || '(missing category_slug)');
    }
  }
  if (unknownCategories.length > 0) {
    const unique = [...new Set(unknownCategories)];
    return { error: `Unknown or missing category: ${unique.join(', ')}`, inserted: 0, failed: 0 };
  }

  const toNum = (v?: string) => (v && !isNaN(Number(v)) ? Number(v) : null);
  const toBool = (v?: string) => v?.toLowerCase() === 'true';

  const dbRows = rows.map(row => {
    const dims: Record<string, number> = {};
    if (toNum(row.width_mm)) dims.width_mm = toNum(row.width_mm)!;
    if (toNum(row.height_mm)) dims.height_mm = toNum(row.height_mm)!;
    if (toNum(row.depth_mm)) dims.depth_mm = toNum(row.depth_mm)!;
    if (toNum(row.diameter_mm)) dims.diameter_mm = toNum(row.diameter_mm)!;
    if (toNum(row.cutout_mm)) dims.cutout_mm = toNum(row.cutout_mm)!;
    if (toNum(row.length_mm)) dims.length_mm = toNum(row.length_mm)!;

    const controlParts = row.control_types
      ? row.control_types.split('|').map(s => s.trim()).filter(Boolean)
      : [];

    let dp: number | null = toNum(row.distributor_price);
    if (dp === null) {
      const cost = toNum(row.cost_usd);
      const margin = toNum(row.distributor_margin_pct);
      if (cost && margin && margin < 100) {
        dp = calcDistributorPrice(cost, margin);
      }
    }

    const prodId = row.product_slug ? prodMap.get(row.product_slug.trim()) ?? null : null;
    const categoryIdFromProduct = prodId ? prodCatMap.get(prodId) ?? null : null;
    const environmentFromProduct = prodId ? prodEnvironmentMap.get(prodId) ?? null : null;
    const category_id = categoryIdFromProduct ?? catMap.get(row.category_slug.trim())!;

    return {
      name: row.name.trim(),
      code: row.code.trim(),
      slug: row.slug?.trim() || slugify(row.name.trim()),
      short_description: row.short_description?.trim() || '',
      long_description: row.long_description?.trim() || '',
      product_id: prodId,
      category_id,
      environment: environmentFromProduct,
      mounting_type: row.mounting_type?.trim() || null,
      ip_rating: row.ip_rating?.trim() || null,
      light_source: row.light_source?.trim() || null,
      power_w: toNum(row.power_w),
      lumens: toNum(row.lumens),
      efficacy_lm_per_w: toNum(row.efficacy_lm_per_w),
      cct_min: toNum(row.cct_min),
      cct_max: toNum(row.cct_max),
      cri: toNum(row.cri),
      control_types: controlParts,
      voltage: row.voltage?.trim() || null,
      class: row.class?.trim() || null,
      material: row.material?.trim() || null,
      finish: row.finish?.trim() || null,
      dimensions: Object.keys(dims).length > 0 ? dims : null,
      manufacturer: row.manufacturer?.trim() || null,
      manufacturer_sku: row.manufacturer_sku?.trim() || null,
      cost_usd: toNum(row.cost_usd),
      distributor_price: dp,
      is_active: row.is_active !== undefined ? toBool(row.is_active) : true,
      is_featured: toBool(row.is_featured),
    };
  });

  const { data, error } = await supabase.from('product_variants').insert(dbRows).select('id');

  if (error) return { error: error.message, inserted: 0, failed: rows.length };

  revalidatePath('/admin/variants');
  revalidatePath('/products');
  revalidatePath('/');

  return { inserted: data?.length || 0, failed: rows.length - (data?.length || 0) };
}
