import { createClient } from '@/lib/supabase/server';
import { InspirationManager } from '@/components/admin/InspirationManager';
import type { InspirationProject } from '@/lib/types';

export default async function AdminInspirationPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Inspiration Projects
          </h1>
          <p className="text-gray-600">
            Manage inspiration projects
          </p>
        </div>
        <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-800">
          <p className="font-medium">Supabase not configured</p>
          <p className="text-sm mt-1">
            Configure your Supabase environment variables to manage projects.
          </p>
        </div>
      </div>
    );
  }

  const { data: projects } = await supabase
    .from('inspiration_projects')
    .select('*')
    .order('sort_order');

  return (
    <InspirationManager initialProjects={(projects ?? []) as InspirationProject[]} />
  );
}
