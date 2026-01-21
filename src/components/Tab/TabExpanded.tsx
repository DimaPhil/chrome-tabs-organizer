import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { cn, truncateUrl, formatRelativeTime, FALLBACK_FAVICON, handleFaviconError } from '@/utils';
import { PinnedIndicator } from './PinnedIndicator';

interface TabExpandedProps {
  tab: Tab;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick: (tab: Tab) => void;
  onContextMenu: (e: MouseEvent, tab: Tab) => void;
}

export function TabExpanded({
  tab,
  isHighlighted,
  isDimmed,
  onClick,
  onContextMenu,
}: TabExpandedProps) {
  const handleClick = () => {
    onClick(tab);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, tab);
  };

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-smooth',
        'bg-card hover:bg-accent border border-transparent hover:border-border',
        tab.active && 'ring-2 ring-primary',
        isHighlighted && 'bg-accent border-primary',
        isDimmed && 'opacity-40'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {tab.pinned && <PinnedIndicator size="md" />}

      <img
        src={tab.favIconUrl || FALLBACK_FAVICON}
        alt=""
        className="w-8 h-8 flex-shrink-0 rounded mt-0.5"
        onError={handleFaviconError}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground truncate">{tab.title}</span>
          {tab.active && (
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
          )}
        </div>

        <div className="text-xs text-muted-foreground truncate mt-0.5">
          {truncateUrl(tab.url, 60)}
        </div>

        {tab.lastAccessed && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(tab.lastAccessed)}
          </div>
        )}
      </div>
    </div>
  );
}
