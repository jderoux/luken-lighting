import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/ProductGrid';
import { VariantsTable } from '@/components/VariantsTable';
import { ProductTabs } from '@/components/ProductTabs';
import { createClient } from '@/lib/supabase/server';
import { ProductVariant, ProductAsset, ProductSku } from '@/lib/types';
import { formatDimensions, formatCCT } from '@/lib/utils';
import { generateMetadata as genMeta, generateProductSchema } from '@/lib/seo';
import {
  Download,
  FileText,
  Shield,
  Zap,
  Lightbulb,
  Settings,
  Maximize,
  RotateCw,
  ChevronRight,
  BookOpen,
  FileSpreadsheet,
  Box,
  Ruler,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ mounting?: string; ip?: string; control?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) return genMeta({ title: 'Not Found' });

  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (product) {
    return genMeta({
      title: product.name,
      description: product.description,
      path: `/products/${slug}`,
    });
  }

  const { data: variant } = await supabase
    .from('product_variants')
    .select('name, short_description')
    .eq('slug', slug)
    .single();

  if (variant) {
    return genMeta({
      title: variant.name,
      description: variant.short_description,
      path: `/products/${slug}`,
    });
  }

  return genMeta({ title: 'Not Found' });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = searchParams ? await searchParams : {};
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: product } = await supabase
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('slug', slug)
    .single();

  if (product) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select(`*, category:product_categories(*), product:products(*), assets:product_assets(*)`)
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('name');

    return (
      <ProductView
        product={product}
        variants={(variants as ProductVariant[]) || []}
        filterMounting={filters.mounting}
        filterIp={filters.ip}
        filterControl={filters.control}
      />
    );
  }

  const { data: variant, error } = await supabase
    .from('product_variants')
    .select(`*, category:product_categories(*), product:products(*), skus:product_skus(*), assets:product_assets(*)`)
    .eq('slug', slug)
    .single();

  if (error || !variant) {
    notFound();
  }

  const { data: relatedVariants } = await supabase
    .from('product_variants')
    .select(`*, category:product_categories(*), assets:product_assets(*)`)
    .eq('category_id', variant.category_id)
    .eq('is_active', true)
    .neq('id', variant.id)
    .limit(4);

  return <VariantView variant={variant} relatedVariants={(relatedVariants as ProductVariant[]) || []} />;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const CONTROL_LABELS: Record<string, string> = {
  'on-off': 'On/Off',
  phase: 'Phase Cut',
  dali: 'DALI',
  '0-10v': '0-10V',
  '1-10v': '1-10V',
  casambi: 'Casambi',
  zigbee: 'Zigbee',
  dmx: 'DMX512',
  push: 'Push-dim',
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  datasheet: 'Datasheet',
  photometric: 'Photometric Data',
  manual: 'Installation Manual',
  catalogue: 'Catalogue',
  line_drawing: 'Line Drawing',
  revit: 'Revit Model',
  '3d': '3D Model',
  other: 'Document',
};

const ASSET_TYPE_ICONS: Record<string, typeof FileText> = {
  datasheet: FileText,
  photometric: FileSpreadsheet,
  manual: BookOpen,
  line_drawing: Ruler,
  catalogue: BookOpen,
  revit: Box,
  '3d': Box,
  other: Download,
};

function buildFilterUrl(
  base: string,
  current: { mounting?: string; ip?: string; control?: string },
  key: 'mounting' | 'ip' | 'control',
  value: string | null
) {
  const next = { ...current, [key]: value || undefined };
  if (!next.mounting) delete next.mounting;
  if (!next.ip) delete next.ip;
  if (!next.control) delete next.control;
  const q = new URLSearchParams(next as Record<string, string>).toString();
  return q ? `${base}?${q}` : base;
}

/* ─── Product view (iGuzzini-style) ────────────────────────────────────────── */

function ProductView({
  product,
  variants,
  filterMounting,
  filterIp,
  filterControl,
}: {
  product: any;
  variants: ProductVariant[];
  filterMounting?: string;
  filterIp?: string;
  filterControl?: string;
}) {
  const baseUrl = `/products/${product.slug}`;
  const currentFilters = {
    mounting: filterMounting,
    ip: filterIp,
    control: filterControl,
  };

  const filtered = variants.filter((v) => {
    if (filterMounting && v.mounting_type !== filterMounting) return false;
    if (filterIp && v.ip_rating !== filterIp) return false;
    if (filterControl && !(v.control_types && v.control_types.includes(filterControl)))
      return false;
    return true;
  });

  const uniqueMounting = [
    ...new Set(variants.map((v) => v.mounting_type).filter(Boolean)),
  ] as string[];
  const uniqueIp = [
    ...new Set(variants.map((v) => v.ip_rating).filter(Boolean)),
  ] as string[];
  const uniqueControl = [
    ...new Set(variants.flatMap((v) => v.control_types || [])),
  ]
    .filter(Boolean)
    .sort();
  const uniqueClasses = [
    ...new Set(variants.map((v) => v.class).filter(Boolean)),
  ] as string[];

  const categoryName = product.category?.name || null;

  return (
    <div className="py-8 lg:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2 -mb-2 lg:pb-0 lg:mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <Link href="/products" className="hover:text-gray-900 transition-colors flex-shrink-0">
            Products
          </Link>
          {categoryName && (
            <>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-gray-400 flex-shrink-0">{categoryName}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-gray-900 flex-shrink-0">{product.name}</span>
        </nav>

        {/* Hero: two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Product image */}
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
            {product.hero_image_url ? (
              <img
                src={product.hero_image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                <Lightbulb className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-light tracking-widest uppercase mb-6">
              {product.name}
            </h1>

            {/* Overview */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Overview
                </h2>
                <div className="space-y-2">
                  {product.description
                    .split('\n')
                    .filter((line: string) => line.trim())
                    .map((line: string, i: number) => (
                      <div key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="text-gray-300 mt-1 flex-shrink-0">•</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Protection Ratings */}
            {(uniqueIp.length > 0 || uniqueClasses.length > 0) && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Protection Ratings
                </h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueClasses.map((cls) => (
                    <div
                      key={cls}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100"
                    >
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{cls}</span>
                    </div>
                  ))}
                  {uniqueIp.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100"
                    >
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{ip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {(uniqueMounting.length > 0 || uniqueControl.length > 0) && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Key Features
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueMounting.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-sm text-gray-600">
                      <Maximize className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="capitalize">{m} mounting</span>
                    </div>
                  ))}
                  {uniqueControl.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-sm text-gray-600">
                      <Settings className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{CONTROL_LABELS[c] || c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product codes section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light tracking-wide uppercase">Product Codes</h2>
            <span className="text-sm text-gray-500">
              {filtered.length} variant{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filters */}
          {variants.length > 0 &&
            (uniqueMounting.length > 0 || uniqueIp.length > 0 || uniqueControl.length > 0) && (
              <div className="mb-6 flex flex-wrap items-center gap-4 sm:gap-6 pb-6 border-b border-gray-200 overflow-x-auto">
                {uniqueMounting.length > 0 && (
                  <FilterGroup
                    label="Mounting"
                    options={uniqueMounting}
                    current={currentFilters.mounting}
                    buildUrl={(val) => buildFilterUrl(baseUrl, currentFilters, 'mounting', val)}
                  />
                )}
                {uniqueIp.length > 0 && (
                  <FilterGroup
                    label="IP"
                    options={uniqueIp}
                    current={currentFilters.ip}
                    buildUrl={(val) => buildFilterUrl(baseUrl, currentFilters, 'ip', val)}
                  />
                )}
                {uniqueControl.length > 0 && (
                  <FilterGroup
                    label="Control"
                    options={uniqueControl}
                    current={currentFilters.control}
                    buildUrl={(val) => buildFilterUrl(baseUrl, currentFilters, 'control', val)}
                    labels={CONTROL_LABELS}
                  />
                )}
              </div>
            )}

          {filtered.length > 0 ? (
            <VariantsTable variants={filtered} />
          ) : (
            <div className="text-center py-12 border border-gray-200">
              <p className="text-gray-500">
                {variants.length > 0
                  ? 'No variants match the selected filters.'
                  : 'No variants in this product yet.'}
              </p>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  current,
  buildUrl,
  labels,
}: {
  label: string;
  options: string[];
  current?: string;
  buildUrl: (value: string | null) => string;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">{label}</span>
      <Link
        href={buildUrl(null)}
        className={`px-3 py-1.5 text-xs border transition-colors ${
          !current
            ? 'bg-gray-900 text-white border-gray-900'
            : 'border-gray-300 text-gray-600 hover:border-gray-900'
        }`}
      >
        All
      </Link>
      {options.map((opt) => (
        <Link
          key={opt}
          href={buildUrl(opt)}
          className={`px-3 py-1.5 text-xs border transition-colors ${
            current === opt
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-300 text-gray-600 hover:border-gray-900'
          }`}
        >
          {labels?.[opt] || opt}
        </Link>
      ))}
    </div>
  );
}

/* ─── Variant detail view (iGuzzini-style with tabs) ──────────────────────── */

function VariantView({
  variant,
  relatedVariants,
}: {
  variant: any;
  relatedVariants: ProductVariant[];
}) {
  const images =
    variant.assets?.filter((a: ProductAsset) => a.type === 'image') || [];
  const documents =
    variant.assets?.filter((a: ProductAsset) => a.type !== 'image') || [];
  const mainImage = images[0]?.file_url || '/images/placeholder-product.jpg';
  const skus: ProductSku[] = variant.skus || [];

  const documentsByType = documents.reduce(
    (acc: Record<string, ProductAsset[]>, doc: ProductAsset) => {
      const type = doc.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    },
    {} as Record<string, ProductAsset[]>
  );

  const overviewContent = (
    <div className="space-y-8">
      {/* Description as bullet points */}
      {variant.long_description && (
        <div className="space-y-2 max-w-3xl">
          {variant.long_description
            .split('\n')
            .filter((line: string) => line.trim())
            .map((line: string, i: number) => (
              <div key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-300 mt-0.5 flex-shrink-0">•</span>
                <span>{line.trim()}</span>
              </div>
            ))}
        </div>
      )}

      {/* Key specs grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Key Specifications
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {variant.power_w && (
            <SpecCard icon={Zap} label="Power" value={`${variant.power_w}W`} />
          )}
          {variant.lumens && (
            <SpecCard icon={Lightbulb} label="Luminous Flux" value={`${variant.lumens}lm`} />
          )}
          {variant.efficacy_lm_per_w && (
            <SpecCard icon={Zap} label="Efficacy" value={`${variant.efficacy_lm_per_w}lm/W`} />
          )}
          {(variant.cct_min || variant.cct_max) && (
            <SpecCard
              icon={Lightbulb}
              label="Color Temperature"
              value={formatCCT(variant.cct_min, variant.cct_max)}
            />
          )}
          {variant.cri && (
            <SpecCard icon={Lightbulb} label="CRI" value={`≥${variant.cri}`} />
          )}
          {variant.voltage && (
            <SpecCard icon={Zap} label="Voltage" value={variant.voltage} />
          )}
          {variant.ip_rating && (
            <SpecCard icon={Shield} label="IP Rating" value={variant.ip_rating} />
          )}
          {variant.dimensions && (
            <SpecCard
              icon={Maximize}
              label="Dimensions"
              value={formatDimensions(variant.dimensions)}
            />
          )}
        </div>
      </div>
    </div>
  );

  const specsContent = (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-[400px]">
        <tbody>
          <SpecRow label="Mounting Type" value={variant.mounting_type} />
          <SpecRow label="Light Source" value={variant.light_source} />
          <SpecRow label="Power" value={variant.power_w ? `${variant.power_w}W` : null} />
          <SpecRow label="Luminous Flux" value={variant.lumens ? `${variant.lumens}lm` : null} />
          <SpecRow
            label="Efficacy"
            value={variant.efficacy_lm_per_w ? `${variant.efficacy_lm_per_w}lm/W` : null}
          />
          <SpecRow
            label="Color Temperature"
            value={
              variant.cct_min || variant.cct_max
                ? formatCCT(variant.cct_min, variant.cct_max)
                : null
            }
          />
          <SpecRow label="CRI" value={variant.cri ? `≥${variant.cri}` : null} />
          <SpecRow
            label="Control"
            value={
              variant.control_types && variant.control_types.length > 0
                ? variant.control_types
                    .map((ct: string) => CONTROL_LABELS[ct] || ct)
                    .join(', ')
                : null
            }
          />
          <SpecRow label="Voltage" value={variant.voltage} />
          <SpecRow label="IP Rating" value={variant.ip_rating} />
          <SpecRow label="Electrical Class" value={variant.class} />
          <SpecRow label="Material" value={variant.material} />
          <SpecRow label="Finish" value={variant.finish} />
          <SpecRow
            label="Dimensions"
            value={variant.dimensions ? formatDimensions(variant.dimensions) : null}
          />
        </tbody>
      </table>
    </div>
  );

  const downloadsContent =
    documents.length > 0 ? (
      <div className="space-y-8">
        {Object.entries(documentsByType).map(([type, docs]) => {
          const Icon = ASSET_TYPE_ICONS[type] || Download;
          return (
            <div key={type}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {ASSET_TYPE_LABELS[type] || type}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(docs as ProductAsset[]).map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <Icon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">
                        {doc.file_extension}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ) : null;

  const tabs = [
    { id: 'overview', label: 'Overview', content: overviewContent },
    { id: 'specs', label: 'Technical Specs', content: specsContent },
    { id: 'downloads', label: 'Downloads', content: downloadsContent },
  ].filter((t) => t.content !== null);

  return (
    <div className="py-8 lg:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2 -mb-2 lg:pb-0 lg:mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <Link href="/products" className="hover:text-gray-900 transition-colors flex-shrink-0">
            Products
          </Link>
          {variant.product && (
            <>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <Link
                href={`/products/${variant.product.slug}`}
                className="hover:text-gray-900 transition-colors flex-shrink-0"
              >
                {variant.product.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-gray-900 flex-shrink-0">{variant.name}</span>
        </nav>

        {/* Hero: image + info */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <Image
                src={mainImage}
                alt={variant.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((image: ProductAsset) => (
                  <div key={image.id} className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={image.file_url}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                {variant.code}
              </p>
              <h1 className="text-3xl lg:text-4xl font-light tracking-wide mb-3">
                {variant.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {variant.short_description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {variant.category && (
                <span className="px-3 py-1 text-xs uppercase tracking-wide border border-gray-200 bg-gray-50 text-gray-700">
                  {variant.category.name}
                </span>
              )}
              {variant.ip_rating && (
                <span className="px-3 py-1 text-xs uppercase tracking-wide border border-gray-200 bg-gray-50 text-gray-700">
                  {variant.ip_rating}
                </span>
              )}
              {variant.class && (
                <span className="px-3 py-1 text-xs uppercase tracking-wide border border-gray-200 bg-gray-50 text-gray-700">
                  {variant.class}
                </span>
              )}
            </div>

            {/* Quick specs */}
            <div className="border-t border-gray-200 pt-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                {variant.power_w && (
                  <>
                    <span className="text-gray-500">Power</span>
                    <span className="font-medium">{variant.power_w}W</span>
                  </>
                )}
                {variant.lumens && (
                  <>
                    <span className="text-gray-500">Luminous Flux</span>
                    <span className="font-medium">{variant.lumens}lm</span>
                  </>
                )}
                {(variant.cct_min || variant.cct_max) && (
                  <>
                    <span className="text-gray-500">CCT</span>
                    <span className="font-medium">
                      {formatCCT(variant.cct_min, variant.cct_max)}
                    </span>
                  </>
                )}
                {variant.control_types && variant.control_types.length > 0 && (
                  <>
                    <span className="text-gray-500">Control</span>
                    <span className="font-medium">
                      {variant.control_types
                        .map((ct: string) => CONTROL_LABELS[ct] || ct)
                        .join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs: Overview / Technical Specs / Downloads */}
        {tabs.length > 0 && (
          <div className="mb-16">
            <ProductTabs tabs={tabs} />
          </div>
        )}

        {/* SKUs table */}
        {skus.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-light tracking-wide uppercase mb-6">
              Product Codes
            </h2>
            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Code
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Finish
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      CCT
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Lumens
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skus.map((sku, i) => (
                    <tr
                      key={sku.id}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                        {sku.code}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        {sku.name}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {sku.finish || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {sku.cct ? `${sku.cct}K` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {sku.lumens ? `${sku.lumens}lm` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedVariants.length > 0 && (
          <section>
            <h2 className="text-2xl font-light tracking-wide uppercase mb-6">
              Related Products
            </h2>
            <ProductGrid products={relatedVariants} />
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateProductSchema({
                name: variant.name,
                description: variant.short_description,
                code: variant.code,
              })
            ),
          }}
        />
      </Container>
    </div>
  );
}

/* ─── Shared sub-components ────────────────────────────────────────────────── */

function SpecCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <tr className="border-b border-gray-100 last:border-b-0 even:bg-gray-50/50">
      <td className="px-6 py-3.5 text-sm text-gray-500 w-1/3">{label}</td>
      <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{value}</td>
    </tr>
  );
}
