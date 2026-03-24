'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function ProductTabs({ tabs, defaultTab }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const visibleTabs = tabs.filter((t) => t.content !== null && t.content !== undefined);
  if (visibleTabs.length === 0) return null;

  const active = visibleTabs.find((t) => t.id === activeTab) || visibleTabs[0];

  return (
    <div>
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto -mb-px">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 sm:px-6 py-3.5 text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap flex-shrink-0',
                active.id === tab.id
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {active.id === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-8">
        {active.content}
      </div>
    </div>
  );
}
