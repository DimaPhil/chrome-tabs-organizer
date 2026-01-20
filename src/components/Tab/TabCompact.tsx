import { type MouseEvent, useState, useRef } from 'react';
import type { Tab } from '@/types';
import { cn, truncateTitle, FALLBACK_FAVICON } from '@/utils';
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
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = () => {
    if (!showTooltip) return;
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        // Position tooltip above or below based on screen position
        const spaceBelow = window.innerHeight - rect.bottom;
        const y = spaceBelow > 200 ? rect.bottom + 8 : rect.top - 8;
        setTooltipPosition({ x: rect.left, y });
      }
      setIsHovered(true);
    }, 400); // 400ms delay before showing tooltip
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Pinned indicator */}
        {tab.pinned && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-2 h-2 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 002-2V5z" />
            </svg>
          </div>
        )}

        {/* Favicon */}
        <img
          src={tab.favIconUrl || FALLBACK_FAVICON}
          alt=""
          className="w-4 h-4 flex-shrink-0 rounded"
          onError={handleFaviconError}
        />

        {/* Title */}
        <span className="text-sm text-card-foreground truncate flex-1">
          {truncateTitle(tab.title, 40)}
        </span>

        {/* Active indicator */}
        {tab.active && (
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
        )}
      </div>

      {/* Tooltip portal */}
      {isHovered && showTooltip && (
        <div
          className="fixed z-[100] pointer-events-none animate-in fade-in duration-150"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform:
              tooltipPosition.y > (elementRef.current?.getBoundingClientRect().bottom ?? 0)
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
