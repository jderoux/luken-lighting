'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/Button';
import { LogOut } from 'lucide-react';

export function AdminHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center py-4">
        <div className="flex w-64 shrink-0 items-center px-8">
          <Link href="/admin/dashboard" className="flex items-center shrink-0">
            <Image
              src="/luken-logo.svg"
              alt="Luken Lighting"
              width={120}
              height={31}
              className="h-5 lg:h-7 w-auto"
            />
          </Link>
        </div>
        <div className="flex items-center -ml-[2px]">
          <span className="text-gray-300 shrink-0" aria-hidden>|</span>
          <span className="text-sm font-medium tracking-widest uppercase text-gray-600 shrink-0 pl-8">
            Admin Portal
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

