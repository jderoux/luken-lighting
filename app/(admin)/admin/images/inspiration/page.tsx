import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EntityImageCard } from '@/components/admin/EntityImageCard';
import { ArrowLeft } from 'lucide-react';
import type { InspirationProject } from '@/lib/types';

export default async function CmsInspirationPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Inspiration Project Images
          </h1>
          <p className="text-gray-600">Supabase not configured</p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from('inspiration_projects')
    .select('*')
    .order('sort_order');

  const projects = (data ?? []) as InspirationProject[];

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
          Inspiration Project Images
        </h1>
        <p className="text-gray-600">
          Thumbnails appear on listing pages. Heroes are the banners on detail pages.
        </p>
      </div>

      {projects.length > 0 ? (
        projects.map((project) => (
          <section key={project.id}>
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
              {project.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EntityImageCard
                table="inspiration_projects"
                field="thumbnail_url"
                entityId={project.id}
                entityName={project.name}
                label={`${project.name} — Thumbnail`}
                currentImageUrl={project.thumbnail_url}
              />
              <EntityImageCard
                table="inspiration_projects"
                field="hero_image_url"
                entityId={project.id}
                entityName={project.name}
                label={`${project.name} — Hero`}
                currentImageUrl={project.hero_image_url}
              />
            </div>
          </section>
        ))
      ) : (
        <div className="p-6 bg-gray-50 border border-gray-200 text-gray-500 text-sm">
          No projects found. Create projects first in the{' '}
          <Link href="/admin/inspiration" className="underline hover:text-gray-900">
            Inspiration
          </Link>{' '}
          section.
        </div>
      )}
    </div>
  );
}
