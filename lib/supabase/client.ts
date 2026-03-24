/**
 * Client-side Supabase client
 * Use this in Client Components
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if credentials are not configured
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    return null;
  }

  try {
    return createBrowserClient(url, key);
  } catch {
    return null;
  }
}

