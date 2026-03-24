'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateVariant(variantId: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const productId = (formData.get('product_id') as string) || null;
  let categoryId = (formData.get('category_id') as string) || null;
  let environment = (formData.get('environment') as string) || null;

  if (productId) {
    const { data: product } = await supabase
      .from('products')
      .select('category_id, environment')
      .eq('id', productId)
      .single();
    if (product?.category_id) categoryId = product.category_id;
    if (product?.environment) environment = product.environment;
  }

  const data: Record<string, any> = {
    name: formData.get('name'),
    code: formData.get('code'),
    slug: formData.get('slug'),
    short_description: formData.get('short_description'),
    long_description: formData.get('long_description'),
    category_id: categoryId,
    environment,
    product_id: productId,
    mounting_type: formData.get('mounting_type') || null,
    ip_rating: formData.get('ip_rating') || null,
    light_source: formData.get('light_source') || null,
    power_w: formData.get('power_w') ? Number(formData.get('power_w')) : null,
    lumens: formData.get('lumens') ? Number(formData.get('lumens')) : null,
    efficacy_lm_per_w: formData.get('efficacy_lm_per_w') ? Number(formData.get('efficacy_lm_per_w')) : null,
    cct_min: formData.get('cct_min') ? Number(formData.get('cct_min')) : null,
    cct_max: formData.get('cct_max') ? Number(formData.get('cct_max')) : null,
    cri: formData.get('cri') ? Number(formData.get('cri')) : null,
    control_types: formData.getAll('control_types').filter(Boolean) as string[],
    voltage: formData.get('voltage') || null,
    class: formData.get('class') || null,
    material: formData.get('material') || null,
    finish: formData.get('finish') || null,
    manufacturer: formData.get('manufacturer') || null,
    manufacturer_sku: formData.get('manufacturer_sku') || null,
    cost_usd: formData.get('cost_usd') ? Number(formData.get('cost_usd')) : null,
    distributor_price: formData.get('distributor_price') ? Number(formData.get('distributor_price')) : null,
    is_active: formData.getAll('is_active').includes('true'),
    is_featured: formData.getAll('is_featured').includes('true'),
  };

  const dimWidth = formData.get('dim_width');
  const dimHeight = formData.get('dim_height');
  const dimDepth = formData.get('dim_depth');
  const dimDiameter = formData.get('dim_diameter');
  const dimCutout = formData.get('dim_cutout');
  const dimLength = formData.get('dim_length');

  const dimensions: Record<string, number> = {};
  if (dimWidth) dimensions.width_mm = Number(dimWidth);
  if (dimHeight) dimensions.height_mm = Number(dimHeight);
  if (dimDepth) dimensions.depth_mm = Number(dimDepth);
  if (dimDiameter) dimensions.diameter_mm = Number(dimDiameter);
  if (dimCutout) dimensions.cutout_mm = Number(dimCutout);
  if (dimLength) dimensions.length_mm = Number(dimLength);
  data.dimensions = Object.keys(dimensions).length > 0 ? dimensions : null;

  const { error } = await supabase
    .from('product_variants')
    .update(data)
    .eq('id', variantId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/variants/${variantId}`);
  revalidatePath('/admin/variants');
  revalidatePath('/products');
  return { success: true };
}

export async function saveVariantAsset(
  variantId: string,
  assetType: string,
  title: string,
  fileUrl: string,
  fileExtension: string
) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { error: dbError, data } = await supabase
    .from('product_assets')
    .insert({
      variant_id: variantId,
      type: assetType,
      title,
      file_url: fileUrl,
      file_extension: fileExtension,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };

  revalidatePath(`/admin/variants/${variantId}`);
  return { success: true, asset: data };
}

export async function deleteVariantAsset(assetId: string, variantId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: asset } = await supabase
    .from('product_assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (asset?.file_url) {
    const isImage = asset.type === 'image';
    const bucket = isImage ? 'product-images' : 'documents';
    const url = new URL(asset.file_url);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (pathParts[1]) {
      await supabase.storage.from(bucket).remove([pathParts[1]]);
    }
  }

  const { error } = await supabase
    .from('product_assets')
    .delete()
    .eq('id', assetId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/variants/${variantId}`);
  return { success: true };
}

export async function deleteVariant(variantId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: assets } = await supabase
    .from('product_assets')
    .select('*')
    .eq('variant_id', variantId);

  if (assets) {
    for (const asset of assets) {
      if (asset.file_url?.includes('/storage/v1/object/public/')) {
        const isImage = asset.type === 'image';
        const bucket = isImage ? 'product-images' : 'documents';
        const pathParts = asset.file_url.split(`/storage/v1/object/public/${bucket}/`);
        if (pathParts[1]) {
          await supabase.storage.from(bucket).remove([decodeURIComponent(pathParts[1])]);
        }
      }
    }
  }

  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) return { error: error.message };

  revalidatePath('/admin/variants');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}
