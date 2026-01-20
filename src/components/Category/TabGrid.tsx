import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { TabCompact } from '@/components/Tab/TabCompact';
import { cn } from '@/utils';

interface TabGridProps {
  tabs: Tab[];
  highlightedTabIds?: Set<number>;
  searchQuery?: string;
  onTabClick: (tab: Tab) => void;
  onTabContextMenu: (e: MouseEvent, tab: Tab) => void;
  compact?: boolean;
}

export function TabGrid({
  tabs,
  highlightedTabIds,
  searchQuery,
  onTabClick,
  onTabContextMenu,
  compact = true,
}: TabGridProps) {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
      {tabs.map((tab) => {
        const isHighlighted = highlightedTabIds?.has(tab.id);
        const isDimmed = hasSearch && !isHighlighted;

        return (
          <TabCompact
            key={tab.id}
            tab={tab}
            isHighlighted={isHighlighted || false}
            isDimmed={isDimmed || false}
            onClick={onTabClick}
            onContextMenu={onTabContextMenu}
          />
        );
      })}
    </div>
  );
}
