import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { cn, truncateTitle, FALLBACK_FAVICON, handleFaviconError } from '@/utils';
import { useTooltipPosition } from '@/hooks';
import { PinnedIndicator } from './PinnedIndicator';
import { TabTooltip } from './TabTooltip';

interface TabCompactProps {
  tab: Tab;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  showTooltip?: boolean;
  onClick: (tab: Tab) => void;
  onContextMenu: (e: MouseEvent, tab: Tab) => void;
}

export function TabCompact({
  tab,
  isHighlighted,
  isDimmed,
  showTooltip = true,
  onClick,
  onContextMenu,
}: TabCompactProps) {
  const { isVisible, position, elementRef, handlers } = useTooltipPosition({
    enabled: showTooltip,
  });

  const handleClick = () => {
    onClick(tab);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, tab);
  };

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          'group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-smooth',
          'bg-card hover:bg-accent border border-transparent hover:border-border',
          tab.active && 'ring-2 ring-primary',
          isHighlighted && 'bg-accent border-primary',
          isDimmed && 'opacity-40'
        )}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
      >
        {tab.pinned && <PinnedIndicator size="sm" />}

        <img
          src={tab.favIconUrl || FALLBACK_FAVICON}
          alt=""
          className="w-4 h-4 flex-shrink-0 rounded"
          onError={handleFaviconError}
        />

        <span className="text-sm text-card-foreground truncate flex-1">
          {truncateTitle(tab.title, 40)}
        </span>

        {tab.active && (
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
        )}
      </div>

      {isVisible && showTooltip && (
        <div
          className="fixed z-[100] pointer-events-none animate-in fade-in duration-150"
          style={{
            left: position.x,
            top: position.y,
            transform:
              position.y > (elementRef.current?.getBoundingClientRect().bottom ?? 0)
                ? 'translateY(0)'
                : 'translateY(-100%)',
          }}
        >
          <TabTooltip tab={tab} />
        </div>
      )}
    </>
  );
}
