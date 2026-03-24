'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Grid3x3,
  Lightbulb,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'CMS', href: '/admin/images', icon: ImageIcon },
  { name: 'Categories', href: '/admin/categories', icon: Grid3x3 },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Variants', href: '/admin/variants', icon: Layers },
  { name: 'Inspiration', href: '/admin/inspiration', icon: Lightbulb },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <nav className="px-4 pt-8 pb-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

