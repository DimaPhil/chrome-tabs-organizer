import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { cn, truncateUrl, formatRelativeTime, FALLBACK_FAVICON, handleFaviconError } from '@/utils';
import { PinnedIndicator } from './PinnedIndicator';

interface SortableTabExpandedProps {
  tab: Tab;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick: (tab: Tab) => void;
  onContextMenu: (e: MouseEvent, tab: Tab) => void;
}

export function SortableTabExpanded({
  tab,
  isHighlighted,
  isDimmed,
  onClick,
  onContextMenu,
}: SortableTabExpandedProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `tab-${tab.id}`,
    data: { type: 'tab', tab },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (!isDragging) {
      onClick(tab);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, tab);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg cursor-grab transition-smooth',
        'bg-card hover:bg-accent border border-transparent hover:border-border',
        tab.active && 'ring-2 ring-primary',
        isHighlighted && 'bg-accent border-primary',
        isDimmed && 'opacity-40',
        isDragging && 'opacity-50 cursor-grabbing shadow-lg z-50'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute top-1/2 left-1 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      {tab.pinned && <PinnedIndicator size="md" />}

      <img
        src={tab.favIconUrl || FALLBACK_FAVICON}
        alt=""
        className="w-8 h-8 flex-shrink-0 rounded mt-0.5 ml-3"
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
