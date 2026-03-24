import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Globe,
  Grid3x3,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

export default async function CmsHubPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            CMS
          </h1>
          <p className="text-gray-600">Manage site images and media</p>
        </div>
        <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-800">
          <p className="font-medium">Supabase not configured</p>
          <p className="text-sm mt-1">
            Configure your Supabase environment variables to manage images.
          </p>
        </div>
      </div>
    );
  }

  const [siteImagesRes, categoriesRes, projectsRes] =
    await Promise.all([
      supabase.from('site_images').select('id, image_url', { count: 'exact' }),
      supabase.from('product_categories').select('id', { count: 'exact' }),
      supabase.from('inspiration_projects').select('id', { count: 'exact' }),
    ]);

  const totalSiteSlots = siteImagesRes.count ?? 0;
  const filledSiteSlots =
    siteImagesRes.data?.filter((i) => i.image_url).length ?? 0;
  const totalCategories = categoriesRes.count ?? 0;
  const totalProjects = projectsRes.count ?? 0;

  const sections = [
    {
      title: 'Site Content',
      description:
        'Homepage hero, about page images, logo, social sharing image, and other site-wide media.',
      href: '/admin/images/site-content',
      icon: Globe,
      stat: `${filledSiteSlots} / ${totalSiteSlots} images set`,
    },
    {
      title: 'Categories',
      description:
        'Hero images for product categories displayed on the homepage and category pages.',
      href: '/admin/images/categories',
      icon: Grid3x3,
      stat: `${totalCategories} ${totalCategories === 1 ? 'category' : 'categories'}`,
    },
    {
      title: 'Inspiration Projects',
      description:
        'Thumbnail and hero images for each inspiration project.',
      href: '/admin/images/inspiration',
      icon: Lightbulb,
      stat: `${totalProjects} ${totalProjects === 1 ? 'project' : 'projects'}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          CMS
        </h1>
        <p className="text-gray-600">Manage site images and media</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white border border-gray-200 p-6 hover:border-gray-900 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    <h2 className="text-lg font-medium uppercase tracking-wide">
                      {section.title}
                    </h2>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {section.description}
                </p>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-4">
                {section.stat}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
