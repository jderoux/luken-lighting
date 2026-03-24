'use client';

import { usePathname } from 'next/navigation';
import { AdminHeader } from '@/components/AdminHeader';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
