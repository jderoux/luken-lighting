import { createClient } from '@/lib/supabase/server';
import { Package, Layers, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to the Luken Lighting administration portal
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-8">
          <h2 className="text-lg font-medium mb-4">Supabase Not Configured</h2>
          <p className="text-gray-700 mb-4">
            Please configure your Supabase credentials to use the admin portal.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Create a <code className="bg-white px-2 py-1 rounded">.env.local</code> file</p>
            <p>2. Add your Supabase URL and API key</p>
            <p>3. Run database migrations</p>
            <p>4. Restart the development server</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            See <code className="bg-white px-2 py-1 rounded">CONFIGURAR_ENV.md</code> for detailed instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
                Variants
              </h3>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-light">-</p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
                Product Families
              </h3>
              <Layers className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-light">-</p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
                Categories
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-light">-</p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
                Documents
              </h3>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-light">-</p>
          </div>
        </div>
      </div>
    );
  }

  const [variantsResult, productsResult, categoriesResult] = await Promise.all([
    supabase.from('product_variants').select('id, is_active, is_featured', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('product_categories').select('id', { count: 'exact' }),
  ]);

  const totalVariants = variantsResult.count || 0;
  const activeVariants = variantsResult.data?.filter(v => v.is_active).length || 0;
  const featuredVariants = variantsResult.data?.filter(v => v.is_featured).length || 0;
  const totalProducts = productsResult.count || 0;
  const totalCategories = categoriesResult.count || 0;

  const { data: recentVariants } = await supabase
    .from('product_variants')
    .select('id, name, code, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to the Luken Lighting administration portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
              Total Variants
            </h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-light">{totalVariants}</p>
          <p className="text-xs text-gray-500 mt-2">
            {activeVariants} active · {featuredVariants} featured
          </p>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
              Product Families
            </h3>
            <Layers className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-light">{totalProducts}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
              Categories
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-light">{totalCategories}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
              Documents
            </h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-light">-</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light tracking-wide uppercase">
            Recent Variants
          </h2>
          <Link
            href="/admin/variants/new"
            className="text-sm uppercase tracking-wide text-gray-900 hover:text-brand-copper"
          >
            Add New →
          </Link>
        </div>

        {recentVariants && recentVariants.length > 0 ? (
          <div className="space-y-4">
            {recentVariants.map((variant) => (
              <Link
                key={variant.id}
                href={`/admin/variants/${variant.id}`}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 -mx-2"
              >
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-gray-500">{variant.code}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 text-xs uppercase tracking-wide ${
                      variant.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {variant.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(variant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No variants yet</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/admin/variants/new"
          className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-900 transition-colors text-center"
        >
          <Package className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="font-medium uppercase tracking-wide mb-1">Add Variant</h3>
          <p className="text-sm text-gray-600">Create a new product variant</p>
        </Link>

        <Link
          href="/admin/products"
          className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-900 transition-colors text-center"
        >
          <Layers className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="font-medium uppercase tracking-wide mb-1">Product Families</h3>
          <p className="text-sm text-gray-600">Manage product families</p>
        </Link>

        <Link
          href="/admin/documents"
          className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-900 transition-colors text-center"
        >
          <FileText className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="font-medium uppercase tracking-wide mb-1">Upload Documents</h3>
          <p className="text-sm text-gray-600">Add datasheets and files</p>
        </Link>
      </div>
    </div>
  );
}
