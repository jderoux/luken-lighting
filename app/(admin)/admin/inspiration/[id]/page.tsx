import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProjectEditPage } from '@/components/admin/ProjectEditPage';
import type { InspirationProject, ProjectImage, ProductVariant } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return <p className="text-red-600">Supabase not configured.</p>;
  }

  const [
    { data: project },
    { data: images },
    { data: linkedRows },
    { data: allVariants },
  ] = await Promise.all([
    supabase
      .from('inspiration_projects')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('project_images')
      .select('*')
      .eq('project_id', id)
      .order('sort_order'),
    supabase
      .from('project_products')
      .select('variant:product_variants(*)')
      .eq('project_id', id),
    supabase
      .from('product_variants')
      .select('id, name, slug, code')
      .eq('is_active', true)
      .order('name'),
  ]);

  if (!project) notFound();

  const linkedProducts = (linkedRows || [])
    .map((row: any) => row.variant)
    .filter(Boolean) as ProductVariant[];

  return (
    <ProjectEditPage
      project={project as InspirationProject}
      images={(images ?? []) as ProjectImage[]}
      linkedProducts={linkedProducts}
      allProducts={(allVariants ?? []) as Pick<ProductVariant, 'id' | 'name' | 'slug' | 'code'>[]}
    />
  );
}
