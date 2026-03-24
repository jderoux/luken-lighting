'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { importVariants } from '@/app/(admin)/admin/variants/import-action';
import { validateRow, type CsvVariantRow, type ImportRowError } from '@/app/(admin)/admin/variants/import-utils';

const CSV_HEADERS = [
  'name', 'code', 'slug', 'short_description', 'long_description',
  'category_slug', 'product_slug', 'mounting_type', 'ip_rating', 'light_source',
  'power_w', 'lumens', 'efficacy_lm_per_w', 'cct_min', 'cct_max', 'cri',
  'control_types', 'voltage', 'class', 'material', 'finish',
  'width_mm', 'height_mm', 'depth_mm', 'diameter_mm', 'cutout_mm', 'length_mm',
  'manufacturer', 'manufacturer_sku', 'cost_usd', 'distributor_price', 'distributor_margin_pct',
  'is_active', 'is_featured',
];

const SAMPLE_ROWS = [
  [
    'Aria Downlight Fixed', 'AR-DL-FX-001', '', 'Elegant fixed downlight with superior beam control', '',
    'downlights', 'lux-series', 'recessed', 'IP20', 'LED Integrated',
    '8', '720', '90', '2700', '3000', '90',
    'phase|dali|0-10v', '220-240V', 'Class II', 'Aluminum', 'White',
    '', '', '95', '90', '75', '',
    'Luken', 'LK-AR-001', '42.50', '60.71', '',
    'true', 'true',
  ],
  [
    'Terra Outdoor Wall Light', 'TR-OD-WL-004', '', 'Weather-resistant exterior wall fixture', '',
    'outdoor-lights', '', 'wall', 'IP65', 'LED Integrated',
    '12', '960', '80', '3000', '3000', '80',
    'on-off', '220-240V', 'Class I', 'Aluminum', 'Anthracite',
    '120', '200', '110', '', '', '',
    'Luken', 'LK-TR-004', '65.00', '', '30',
    'true', 'false',
  ],
];

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function generateTemplateCsv(): string {
  const header = CSV_HEADERS.map(escapeCsvField).join(',');
  const rows = SAMPLE_ROWS.map(r => r.map(escapeCsvField).join(','));
  return [header, ...rows].join('\n');
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    const vals = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
    return obj;
  });
  return { headers, rows };
}

type WizardStep = 'upload' | 'preview' | 'results';

interface ParsedRow {
  data: CsvVariantRow;
  errors: ImportRowError[];
  index: number;
}

export function CsvImportWizard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number; error?: string } | null>(null);

  const downloadTemplate = useCallback(() => {
    const csv = generateTemplateCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luken_variants_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const processFile = useCallback((file: File) => {
    setParseError(null);
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCsv(text);

      const missingRequired = ['name', 'code', 'category_slug'].filter(h => !headers.includes(h));
      if (missingRequired.length > 0) {
        setParseError(`Missing required columns: ${missingRequired.join(', ')}`);
        return;
      }
      if (rows.length === 0) {
        setParseError('CSV file has no data rows');
        return;
      }

      const parsed: ParsedRow[] = rows.map((row, i) => {
        const csvRow = row as unknown as CsvVariantRow;
        const errors = validateRow(csvRow, i);
        return { data: csvRow, errors, index: i };
      });

      setParsedRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const validRows = parsedRows.filter(r => r.errors.length === 0);
  const errorRows = parsedRows.filter(r => r.errors.length > 0);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await importVariants(validRows.map(r => r.data));
      setResult(res);
      setStep('results');
    } catch (err: any) {
      setResult({ inserted: 0, failed: validRows.length, error: err.message });
      setStep('results');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (result && result.inserted > 0) {
      router.refresh();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-medium uppercase tracking-wide">Import Variants</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex gap-6 text-xs uppercase tracking-wider">
          {(['upload', 'preview', 'results'] as const).map((s, i) => (
            <div key={s} className={`flex items-center gap-2 ${step === s ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${step === s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </span>
              {s === 'upload' ? 'Upload' : s === 'preview' ? 'Preview' : 'Results'}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Upload a CSV file to bulk-import variants. Fields like <code className="bg-gray-100 px-1 text-xs">slug</code> are auto-generated if left empty.
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Use <code className="bg-gray-100 px-1 text-xs">|</code> to separate multiple control types (e.g. <code className="bg-gray-100 px-1 text-xs">dali|phase</code>).
                  </p>
                  <p className="text-sm text-gray-600">
                    For pricing, provide <code className="bg-gray-100 px-1 text-xs">distributor_price</code> directly or <code className="bg-gray-100 px-1 text-xs">distributor_margin_pct</code> with <code className="bg-gray-100 px-1 text-xs">cost_usd</code>. MSRP = 2× distributor price.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download Template
                </Button>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-none p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-gray-500">Only .csv files are accepted</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </div>

              {parseError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {parseError}
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {validRows.length} valid
                  </span>
                  {errorRows.length > 0 && (
                    <span className="flex items-center gap-1.5 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errorRows.length} with errors
                    </span>
                  )}
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">{parsedRows.length} total rows</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setStep('upload'); setParsedRows([]); }}>
                  Re-upload
                </Button>
              </div>

              {errorRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <p className="font-medium mb-1">Rows with errors will be skipped:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    {errorRows.slice(0, 10).map((r) =>
                      r.errors.map((e, j) => (
                        <li key={`${r.index}-${j}`}>
                          Row {e.row}: <strong>{e.field}</strong> — {e.message}
                        </li>
                      ))
                    )}
                    {errorRows.length > 10 && (
                      <li className="text-red-500">...and {errorRows.length - 10} more rows with errors</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="border border-gray-200 overflow-x-auto max-h-[40vh]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">#</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Status</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Name</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Code</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Category</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Mounting</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">IP</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Control</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-600 whitespace-nowrap">Power</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.slice(0, 50).map((r) => (
                      <tr key={r.index} className={r.errors.length > 0 ? 'bg-red-50' : ''}>
                        <td className="px-2 py-1.5 text-gray-400">{r.index + 1}</td>
                        <td className="px-2 py-1.5">
                          {r.errors.length > 0 ? (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          )}
                        </td>
                        <td className="px-2 py-1.5 font-medium whitespace-nowrap">{r.data.name}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.code}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.category_slug}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.mounting_type || '—'}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.ip_rating || '—'}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.control_types || '—'}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">{r.data.power_w ? `${r.data.power_w}W` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="text-xs text-gray-500 text-center">Showing 50 of {parsedRows.length} rows</p>
              )}
            </div>
          )}

          {step === 'results' && result && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              {result.error ? (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <h3 className="text-lg font-medium">Import Failed</h3>
                  <p className="text-sm text-red-600 text-center max-w-md">{result.error}</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                  <h3 className="text-lg font-medium">Import Complete</h3>
                  <p className="text-sm text-gray-600">
                    Successfully imported <strong>{result.inserted}</strong> variant{result.inserted !== 1 ? 's' : ''}.
                    {result.failed > 0 && (
                      <span className="text-red-600 ml-1">{result.failed} failed.</span>
                    )}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {step === 'upload' && (
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" onClick={handleImport} disabled={validRows.length === 0 || importing}>
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {validRows.length} Variant{validRows.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </>
          )}
          {step === 'results' && (
            <Button variant="primary" onClick={handleClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );
}
