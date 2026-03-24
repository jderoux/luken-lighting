'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';
import { getSettings, updateSettings } from './actions';
import { convertToEur, formatUsd, formatEur } from '@/lib/pricing';
import type { AppSettings } from '@/lib/types';

const EXAMPLE_USD = 10;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eurRate, setEurRate] = useState('');

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setEurRate(String(s.eur_to_usd_rate));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const rate = Number(eurRate) || 0;

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Settings</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Settings</h1>
        <p className="text-gray-600">Currency conversion rate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium uppercase tracking-wide border-b border-gray-200 pb-3">
            Currency Conversion
          </h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">EUR to USD Rate</label>
            <input
              name="eur_to_usd_rate"
              type="number"
              step="0.0001"
              min="0.0001"
              value={eurRate}
              onChange={(e) => setEurRate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-1">1 EUR = {eurRate || '—'} USD</p>
          </div>
        </section>

        {/* Live Preview */}
        <section className="bg-gray-50 border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Preview
          </h2>
          <p className="text-sm text-gray-700">
            {formatUsd(EXAMPLE_USD)} = {rate > 0 ? formatEur(convertToEur(EXAMPLE_USD, rate)) : '—'}
          </p>
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
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
