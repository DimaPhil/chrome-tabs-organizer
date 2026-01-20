import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { cn, truncateUrl, formatRelativeTime, FALLBACK_FAVICON } from '@/utils';

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

  const handleFaviconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_FAVICON;
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
      {/* Pinned indicator */}
      {tab.pinned && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 002-2V5z" />
          </svg>
        </div>
      )}

      {/* Favicon - larger */}
      <img
        src={tab.favIconUrl || FALLBACK_FAVICON}
        alt=""
        className="w-8 h-8 flex-shrink-0 rounded mt-0.5"
        onError={handleFaviconError}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground truncate">{tab.title}</span>
          {tab.active && (
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
          )}
        </div>

        {/* URL */}
        <div className="text-xs text-muted-foreground truncate mt-0.5">
          {truncateUrl(tab.url, 60)}
        </div>

        {/* Last accessed */}
        {tab.lastAccessed && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(tab.lastAccessed)}
          </div>
        )}
      </div>
    </div>
  );
}
