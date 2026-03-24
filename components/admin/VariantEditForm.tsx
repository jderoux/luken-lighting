'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUploadSection } from './FileUploadSection';
import { updateVariant } from '@/app/(admin)/admin/variants/actions';
import { calcDistributorPrice, calcMarginPct, calcMsrp, convertToEur, formatUsd, formatEur } from '@/lib/pricing';
import type { ProductVariant, ProductCategory, Product, ProductAsset, AppSettings } from '@/lib/types';
import { ALL_CONTROL_TYPES, CONTROL_TYPE_LABELS } from '@/lib/types';

interface Props {
  variant: ProductVariant;
  categories: ProductCategory[];
  products: Product[];
  assets: ProductAsset[];
  settings: AppSettings;
}

export function VariantEditForm({
  variant,
  categories,
  products,
  assets,
  settings,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedControlTypes, setSelectedControlTypes] = useState<string[]>(variant.control_types || []);
  const [selectedProductId, setSelectedProductId] = useState(variant.product_id || '');
  const [categoryId, setCategoryId] = useState(variant.category_id || '');
  const [costUsd, setCostUsd] = useState<number | ''>(variant.cost_usd ?? '');
  const [distPrice, setDistPrice] = useState<number | ''>(variant.distributor_price ?? '');
  const initMargin = (variant.cost_usd && variant.distributor_price)
    ? calcMarginPct(variant.cost_usd, variant.distributor_price)
    : '';
  const [distMargin, setDistMargin] = useState<number | ''>(initMargin);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);

    const result = await updateVariant(variant.id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Variant saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const dims = (variant.dimensions as Record<string, number>) || {};

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/variants"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Variants
          </Link>
          <h1 className="text-3xl font-light tracking-widest uppercase">
            {variant.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Code: {variant.code}</p>
        </div>
        <Link href={`/products/${variant.slug}`} target="_blank">
          <Button type="button" variant="secondary" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View on Site
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Variant Name" name="name" defaultValue={variant.name} required />
            <Input label="Code" name="code" defaultValue={variant.code} required />
          </div>
          <Input label="URL Slug" name="slug" defaultValue={variant.slug} required />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <textarea
              name="short_description"
              rows={2}
              required
              defaultValue={variant.short_description}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Long Description</label>
            <textarea
              name="long_description"
              rows={5}
              defaultValue={variant.long_description}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Family</label>
              <select
                name="product_id"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">— None —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input type="hidden" name="category_id" value={categoryId} />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Manufacturer & Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Manufacturer" name="manufacturer" defaultValue={variant.manufacturer || ''} placeholder="e.g. Factory name" />
            <Input label="Manufacturer SKU" name="manufacturer_sku" defaultValue={variant.manufacturer_sku || ''} placeholder="Factory product code" />
          </div>

          <input type="hidden" name="distributor_price" value={distPrice === '' ? '' : distPrice} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost USD</label>
              <input
                name="cost_usd"
                type="number"
                step="0.01"
                min="0"
                value={costUsd}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' as const : Number(e.target.value);
                  setCostUsd(val);
                  if (val !== '' && val > 0 && distMargin !== '' && Number(distMargin) > 0 && Number(distMargin) < 100) {
                    setDistPrice(calcDistributorPrice(val, Number(distMargin)));
                  }
                }}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Margin %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                value={distMargin}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' as const : Number(e.target.value);
                  setDistMargin(val);
                  if (costUsd !== '' && Number(costUsd) > 0 && val !== '' && val > 0 && val < 100) {
                    setDistPrice(calcDistributorPrice(Number(costUsd), val));
                  }
                }}
                placeholder="e.g. 33.33"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">Margin on selling price</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distributor Price USD</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={distPrice}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' as const : Number(e.target.value);
                  setDistPrice(val);
                  if (costUsd !== '' && Number(costUsd) > 0 && val !== '' && val > 0) {
                    setDistMargin(calcMarginPct(Number(costUsd), val));
                  }
                }}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">Or enter directly</p>
            </div>
          </div>

          {(() => {
            const cost = costUsd !== '' ? Number(costUsd) : null;
            const dp = distPrice !== '' ? Number(distPrice) : null;
            const msrp = dp ? calcMsrp(dp) : null;
            const rate = settings.eur_to_usd_rate;
            if (!cost && !dp) return null;

            return (
              <div className="grid grid-cols-3 gap-5 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cost</p>
                  {cost ? (
                    <>
                      <p className="text-sm font-medium text-gray-700 tabular-nums">{formatUsd(cost)}</p>
                      <p className="text-xs text-gray-400 tabular-nums">{formatEur(convertToEur(cost, rate))}</p>
                    </>
                  ) : <p className="text-sm text-gray-400">—</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Distributor Price</p>
                  {dp ? (
                    <>
                      <p className="text-sm font-medium text-gray-700 tabular-nums">{formatUsd(dp)}</p>
                      <p className="text-xs text-gray-400 tabular-nums">{formatEur(convertToEur(dp, rate))}</p>
                    </>
                  ) : <p className="text-sm text-gray-400">—</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">MSRP (2×)</p>
                  {msrp ? (
                    <>
                      <p className="text-sm font-medium text-gray-700 tabular-nums">{formatUsd(msrp)}</p>
                      <p className="text-xs text-gray-400 tabular-nums">{formatEur(convertToEur(msrp, rate))}</p>
                    </>
                  ) : <p className="text-sm text-gray-400">—</p>}
                </div>
              </div>
            );
          })()}

          <p className="text-xs text-gray-400">
            Cost → your margin → Distributor Price → distributor margin → MSRP. 1 EUR = {settings.eur_to_usd_rate} USD.
          </p>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mounting Type</label>
              <select name="mounting_type" defaultValue={variant.mounting_type || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white">
                <option value="">— Select —</option>
                <option value="recessed">Recessed</option>
                <option value="surface">Surface</option>
                <option value="pendant">Pendant</option>
                <option value="wall">Wall</option>
                <option value="track">Track</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">IP Rating</label>
              <select name="ip_rating" defaultValue={variant.ip_rating || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white">
                <option value="">— Select —</option>
                <option value="IP20">IP20</option>
                <option value="IP44">IP44</option>
                <option value="IP54">IP54</option>
                <option value="IP65">IP65</option>
                <option value="IP67">IP67</option>
                <option value="IP68">IP68</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Light Source</label>
              <select name="light_source" defaultValue={variant.light_source || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white">
                <option value="">— Select —</option>
                <option value="LED Integrated">LED Integrated</option>
                <option value="GU10">GU10</option>
                <option value="E27">E27</option>
                <option value="E14">E14</option>
                <option value="GU5.3">GU5.3</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Power (W)" name="power_w" type="number" step="0.01" defaultValue={variant.power_w ?? ''} />
            <Input label="Lumens (lm)" name="lumens" type="number" step="0.01" defaultValue={variant.lumens ?? ''} />
            <Input label="Efficacy (lm/W)" name="efficacy_lm_per_w" type="number" step="0.01" defaultValue={variant.efficacy_lm_per_w ?? ''} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="CCT Min (K)" name="cct_min" type="number" defaultValue={variant.cct_min ?? ''} placeholder="e.g. 2700" />
            <Input label="CCT Max (K)" name="cct_max" type="number" defaultValue={variant.cct_max ?? ''} placeholder="e.g. 4000" />
            <Input label="CRI" name="cri" type="number" defaultValue={variant.cri ?? ''} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Voltage" name="voltage" defaultValue={variant.voltage || ''} placeholder="e.g. 220-240V" />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Electrical Class</label>
              <select name="class" defaultValue={variant.class || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white">
                <option value="">— Select —</option>
                <option value="Class I">Class I</option>
                <option value="Class II">Class II</option>
                <option value="Class III">Class III</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Material" name="material" defaultValue={variant.material || ''} placeholder="e.g. Aluminum" />
            <Input label="Finish" name="finish" defaultValue={variant.finish || ''} placeholder="e.g. White, Black" />
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Control Options
          </h2>
          <p className="text-sm text-gray-500">Select all dimming and control protocols supported by this variant.</p>
          {selectedControlTypes.map((ct) => (
            <input key={ct} type="hidden" name="control_types" value={ct} />
          ))}
          <div className="flex flex-wrap gap-3">
            {ALL_CONTROL_TYPES.map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() =>
                  setSelectedControlTypes((prev) =>
                    prev.includes(ct) ? prev.filter((t) => t !== ct) : [...prev, ct]
                  )
                }
                className={`px-4 py-2 text-sm border transition-colors ${
                  selectedControlTypes.includes(ct)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                {CONTROL_TYPE_LABELS[ct]}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Dimensions (mm)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Input label="Diameter" name="dim_diameter" type="number" defaultValue={dims.diameter_mm ?? ''} />
            <Input label="Width" name="dim_width" type="number" defaultValue={dims.width_mm ?? ''} />
            <Input label="Height" name="dim_height" type="number" defaultValue={dims.height_mm ?? ''} />
            <Input label="Depth" name="dim_depth" type="number" defaultValue={dims.depth_mm ?? ''} />
            <Input label="Length" name="dim_length" type="number" defaultValue={dims.length_mm ?? ''} />
            <Input label="Cutout" name="dim_cutout" type="number" defaultValue={dims.cutout_mm ?? ''} />
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Status
          </h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="hidden" name="is_active" value="false" />
              <input type="checkbox" name="is_active" value="true" defaultChecked={variant.is_active} className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Active (visible on site)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="hidden" name="is_featured" value="false" />
              <input type="checkbox" name="is_featured" value="true" defaultChecked={variant.is_featured} className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Featured (shown on homepage)</span>
            </label>
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Files & Assets
          </h2>
          <FileUploadSection productId={variant.id} assets={assets} />
        </section>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm">{success}</div>
        )}

        <div className="flex items-center gap-4 pt-2 pb-8">
          <Button type="submit" variant="primary" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href="/admin/variants">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
