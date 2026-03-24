import { type ClassValue, clsx } from 'clsx';

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format dimensions object to readable string
 */
export function formatDimensions(dimensions: any): string {
  if (!dimensions) return 'N/A';
  
  const parts: string[] = [];
  
  if (dimensions.diameter_mm) {
    parts.push(`Ø${dimensions.diameter_mm}mm`);
  }
  if (dimensions.width_mm && dimensions.length_mm) {
    parts.push(`${dimensions.width_mm}×${dimensions.length_mm}mm`);
  } else if (dimensions.width_mm) {
    parts.push(`W${dimensions.width_mm}mm`);
  }
  if (dimensions.height_mm) {
    parts.push(`H${dimensions.height_mm}mm`);
  }
  if (dimensions.depth_mm) {
    parts.push(`D${dimensions.depth_mm}mm`);
  }
  
  return parts.join(' × ') || 'N/A';
}

/**
 * Format CCT range
 */
export function formatCCT(cct_min?: number | null, cct_max?: number | null): string {
  if (!cct_min && !cct_max) return 'N/A';
  if (cct_min === cct_max || !cct_max) return `${cct_min}K`;
  return `${cct_min}K - ${cct_max}K`;
}

