export const VALID_MOUNTING = ['recessed', 'surface', 'pendant', 'wall', 'track'];
export const VALID_IP = ['IP20', 'IP44', 'IP54', 'IP65', 'IP67', 'IP68'];
export const VALID_LIGHT_SOURCE = ['LED Integrated', 'GU10', 'E27', 'E14', 'GU5.3', 'Other'];
export const VALID_CLASS = ['Class I', 'Class II', 'Class III'];
export const VALID_CONTROL = ['on-off', 'phase', 'dali', '0-10v', '1-10v', 'casambi', 'zigbee', 'dmx', 'push'];

export interface CsvVariantRow {
  name: string;
  code: string;
  slug?: string;
  short_description?: string;
  long_description?: string;
  category_slug: string;
  product_slug?: string;
  mounting_type?: string;
  ip_rating?: string;
  light_source?: string;
  power_w?: string;
  lumens?: string;
  efficacy_lm_per_w?: string;
  cct_min?: string;
  cct_max?: string;
  cri?: string;
  control_types?: string;
  voltage?: string;
  class?: string;
  material?: string;
  finish?: string;
  width_mm?: string;
  height_mm?: string;
  depth_mm?: string;
  diameter_mm?: string;
  cutout_mm?: string;
  length_mm?: string;
  manufacturer?: string;
  manufacturer_sku?: string;
  cost_usd?: string;
  distributor_price?: string;
  distributor_margin_pct?: string;
  is_active?: string;
  is_featured?: string;
}

export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

export function validateRow(row: CsvVariantRow, index: number): ImportRowError[] {
  const errors: ImportRowError[] = [];
  const r = index + 1;

  if (!row.name?.trim()) errors.push({ row: r, field: 'name', message: 'Name is required' });
  if (!row.code?.trim()) errors.push({ row: r, field: 'code', message: 'Code is required' });
  if (!row.category_slug?.trim()) errors.push({ row: r, field: 'category_slug', message: 'Category slug is required' });

  if (row.mounting_type && !VALID_MOUNTING.includes(row.mounting_type))
    errors.push({ row: r, field: 'mounting_type', message: `Invalid mounting type: ${row.mounting_type}` });
  if (row.ip_rating && !VALID_IP.includes(row.ip_rating))
    errors.push({ row: r, field: 'ip_rating', message: `Invalid IP rating: ${row.ip_rating}` });
  if (row.light_source && !VALID_LIGHT_SOURCE.includes(row.light_source))
    errors.push({ row: r, field: 'light_source', message: `Invalid light source: ${row.light_source}` });
  if (row.class && !VALID_CLASS.includes(row.class))
    errors.push({ row: r, field: 'class', message: `Invalid class: ${row.class}` });

  if (row.control_types) {
    const parts = row.control_types.split('|').map(s => s.trim()).filter(Boolean);
    const invalid = parts.filter(p => !VALID_CONTROL.includes(p));
    if (invalid.length > 0)
      errors.push({ row: r, field: 'control_types', message: `Invalid control type(s): ${invalid.join(', ')}` });
  }

  const numFields = ['power_w', 'lumens', 'efficacy_lm_per_w', 'cct_min', 'cct_max', 'cri',
    'width_mm', 'height_mm', 'depth_mm', 'diameter_mm', 'cutout_mm', 'length_mm',
    'cost_usd', 'distributor_price', 'distributor_margin_pct'] as const;
  for (const f of numFields) {
    const v = row[f as keyof CsvVariantRow];
    if (v && isNaN(Number(v)))
      errors.push({ row: r, field: f, message: `${f} must be a number` });
  }

  return errors;
}
