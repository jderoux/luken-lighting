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

const CCT_SPECIAL_MAP: Record<number, string> = { [-1]: 'RGB', [-2]: 'RGBW', [-3]: 'RGBWW', [-4]: 'RGB+CCT', [-5]: 'CCT' };

function cctToDropdownValue(cctMin: number | null, cctMax: number | null): string {
  if (cctMin == null) return '';
  if (cctMin < 0) return CCT_SPECIAL_MAP[cctMin] || '';
  if (cctMax && cctMax !== cctMin) return `${cctMin}K-${cctMax}K`;
  return `${cctMin}K`;
}

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
  const [selectedControlType, setSelectedControlType] = useState(variant.control_types?.[0] || '');
  const [powerSource, setPowerSource] = useState<number | ''>(variant.power_w ?? '');
  const [powerSystem, setPowerSystem] = useState<number | ''>(variant.power_w_system ?? '');
  const [lumensSource, setLumensSource] = useState<number | ''>(variant.lumens ?? '');
  const [lumensSystem, setLumensSystem] = useState<number | ''>(variant.lumens_system ?? '');
  const [selectedProductId, setSelectedProductId] = useState(variant.product_id || '');
  const [categoryId, setCategoryId] = useState(variant.category_id || '');
  const [environment, setEnvironment] = useState(variant.environment || '');
  const [costUsd, setCostUsd] = useState<number | ''>(variant.cost_usd ?? '');
  const [distPrice, setDistPrice] = useState<number | ''>(variant.distributor_price ?? '');
  const selectedProduct = products.find((p) => p.id === selectedProductId);
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
            {variant.code}
          </h1>
        </div>
        <Link href={variant.product?.slug ? `/products/${variant.product.slug}/${variant.slug}` : '#'} target="_blank">
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
            <Input label="Code" name="code" defaultValue={variant.code} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product</label>
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
              <input
                type="hidden"
                name="category_id"
                value={selectedProductId ? selectedProduct?.category_id || '' : categoryId}
              />
              <select
                value={selectedProductId ? selectedProduct?.category_id || '' : categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={Boolean(selectedProductId)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedProductId && (
                <p className="text-xs text-gray-500">
                  Inherited from the selected product.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <input
                type="hidden"
                name="environment"
                value={selectedProductId ? selectedProduct?.environment || '' : environment}
              />
              <select
                value={selectedProductId ? selectedProduct?.environment || '' : environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={Boolean(selectedProductId)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">— None —</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
              {selectedProductId && (
                <p className="text-xs text-gray-500">
                  Inherited from the selected product.
                </p>
              )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Beam Angle (°)</label>
              <input name="beam_angle" type="number" min="1" max="360" step="1" defaultValue={variant.beam_angle ?? ''} placeholder="e.g. 36" className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900" />
            </div>
          </div>
          <input type="hidden" name="power_w" value={powerSource} />
          <input type="hidden" name="power_w_system" value={powerSystem} />
          <input type="hidden" name="lumens" value={lumensSource} />
          <input type="hidden" name="lumens_system" value={lumensSystem} />
          <input type="hidden" name="efficacy_lm_per_w" value={powerSource && lumensSource ? (Number(lumensSource) / Number(powerSource)).toFixed(2) : ''} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Power Source (W)</label>
              <input name="_power_w_display" type="number" step="0.01" value={powerSource} onChange={(e) => setPowerSource(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Power System (W)</label>
              <input name="_power_w_sys_display" type="number" step="0.01" value={powerSystem} onChange={(e) => setPowerSystem(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lumens Source (lm)</label>
              <input name="_lumens_display" type="number" step="0.01" value={lumensSource} onChange={(e) => setLumensSource(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lumens System (lm)</label>
              <input name="_lumens_sys_display" type="number" step="0.01" value={lumensSystem} onChange={(e) => setLumensSystem(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="md:col-span-2 bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Efficacy Source</p>
              <p className="text-sm font-medium text-gray-700 tabular-nums">
                {powerSource && lumensSource && Number(powerSource) > 0 ? `${(Number(lumensSource) / Number(powerSource)).toFixed(1)} lm/W` : '—'}
              </p>
            </div>
            <div className="md:col-span-2 bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Efficacy System</p>
              <p className="text-sm font-medium text-gray-700 tabular-nums">
                {powerSystem && lumensSystem && Number(powerSystem) > 0 ? `${(Number(lumensSystem) / Number(powerSystem)).toFixed(1)} lm/W` : '—'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">CCT</label>
              <select
                name="cct_value"
                defaultValue={cctToDropdownValue(variant.cct_min, variant.cct_max)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">— Select —</option>
                <optgroup label="Fixed">
                  <option value="CCT">CCT (Selectable)</option>
                  <option value="1800K">1800K</option>
                  <option value="2200K">2200K</option>
                  <option value="2400K">2400K</option>
                  <option value="2700K">2700K</option>
                  <option value="3000K">3000K</option>
                  <option value="3500K">3500K</option>
                  <option value="4000K">4000K</option>
                  <option value="5000K">5000K</option>
                  <option value="6500K">6500K</option>
                </optgroup>
                <optgroup label="Tunable White">
                  <option value="2700K-6500K">2700K–6500K</option>
                </optgroup>
                <optgroup label="Color">
                  <option value="RGB">RGB</option>
                  <option value="RGBW">RGBW</option>
                  <option value="RGBWW">RGBWW</option>
                  <option value="RGB+CCT">RGB+CCT</option>
                </optgroup>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">CRI</label>
              <select
                name="cri"
                defaultValue={variant.cri ?? ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">— Select —</option>
                <option value="80">80+ CRI</option>
                <option value="90">90+ CRI</option>
                <option value="9050">90+ CRI, R9&gt;50</option>
                <option value="9090">90+ CRI, R9&gt;90</option>
                <option value="95">95+ CRI</option>
                <option value="9550">95+ CRI, R9&gt;50</option>
                <option value="9590">95+ CRI, R9&gt;90</option>
                <option value="97">97+ CRI</option>
                <option value="9790">97+ CRI, R9&gt;90</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Voltage</label>
              <select name="voltage" defaultValue={variant.voltage || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white">
                <option value="">— Select —</option>
                <optgroup label="Universal">
                  <option value="100-240V">100-240V</option>
                  <option value="100-277V">100-277V</option>
                </optgroup>
                <optgroup label="North America">
                  <option value="120V">120V</option>
                  <option value="120-240V">120-240V</option>
                  <option value="120-277V">120-277V</option>
                  <option value="120-347V">120-347V</option>
                </optgroup>
                <optgroup label="Europe / Latin America">
                  <option value="220-240V">220-240V</option>
                </optgroup>
                <optgroup label="Low Voltage">
                  <option value="12V DC">12V DC</option>
                  <option value="24V DC">24V DC</option>
                  <option value="48V DC">48V DC</option>
                </optgroup>
              </select>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Control Type</label>
              <input type="hidden" name="control_types" value={selectedControlType} />
              <select
                value={selectedControlType}
                onChange={(e) => setSelectedControlType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">— Select —</option>
                {ALL_CONTROL_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{CONTROL_TYPE_LABELS[ct]}</option>
                ))}
              </select>
            </div>
            <Input label="Material" name="material" defaultValue={variant.material || ''} placeholder="e.g. Aluminum" />
            <Input label="Finish" name="finish" defaultValue={variant.finish || ''} placeholder="e.g. White, Black" />
          </div>
        </section>

        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Dimensions (mm)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Input label="Width" name="dim_width" type="number" defaultValue={dims.width_mm ?? ''} />
            <Input label="Height" name="dim_height" type="number" defaultValue={dims.height_mm ?? ''} />
            <Input label="Length" name="dim_length" type="number" defaultValue={dims.length_mm ?? ''} />
            <Input label="Weight (kg)" name="dim_weight" type="number" step="0.01" defaultValue={dims.weight_kg ?? ''} />
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
