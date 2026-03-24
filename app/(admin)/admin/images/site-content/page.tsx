import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteImageCard } from '@/components/admin/SiteImageCard';
import { ArrowLeft } from 'lucide-react';
import type { SiteImage } from '@/lib/types';

export default async function SiteContentPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Site Content
          </h1>
          <p className="text-gray-600">Supabase not configured</p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from('site_images')
    .select('*')
    .order('section')
    .order('sort_order');

  const siteImages = (data ?? []) as SiteImage[];

  const groupedSiteImages = siteImages.reduce<Record<string, SiteImage[]>>(
    (acc, img) => {
      const section = img.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(img);
      return acc;
    },
    {}
  );

  const sectionOrder = ['general', 'homepage', 'about', 'professionals'];
  const sectionLabels: Record<string, string> = {
    general: 'General',
    homepage: 'Homepage',
    about: 'About Page',
    professionals: 'Professionals',
  };

  const orderedSections = sectionOrder
    .filter((s) => groupedSiteImages[s])
    .concat(Object.keys(groupedSiteImages).filter((s) => !sectionOrder.includes(s)));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/images"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CMS
        </Link>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Site Content
        </h1>
        <p className="text-gray-600">
          Heroes, backgrounds, logo, and other site-wide images
        </p>
      </div>

      {orderedSections.map((section) => (
        <section key={section}>
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
            {sectionLabels[section] || section}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedSiteImages[section].map((img) => (
              <SiteImageCard key={img.id} image={img} />
            ))}
          </div>
        </section>
      ))}

      {siteImages.length === 0 && (
        <div className="p-6 bg-gray-50 border border-gray-200 text-gray-500 text-sm">
          No image slots found. Run the database migration to create
          pre-defined image slots.
        </div>
      )}
    </div>
  );
}
