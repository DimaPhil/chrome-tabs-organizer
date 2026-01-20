import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type MouseEvent, useState, useRef } from 'react';
import type { Tab } from '@/types';
import { cn, FALLBACK_FAVICON } from '@/utils';
import { TabTooltip } from '@/components/Tab/TabTooltip';

interface DraggableTabProps {
  tab: Tab;
  categoryId: string;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick: (tab: Tab) => void;
  onContextMenu: (e: MouseEvent, tab: Tab) => void;
}

export function DraggableTab({
  tab,
  categoryId,
  isHighlighted,
  isDimmed,
  onClick,
  onContextMenu,
}: DraggableTabProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `tab-${tab.id}`,
    data: { type: 'tab', tab, categoryId },
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

  const handleFaviconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_FAVICON;
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const y = spaceBelow > 200 ? rect.bottom + 8 : rect.top - 8;
        setTooltipPosition({ x: rect.left, y });
      }
      setIsHovered(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  };

  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <>
      <div
        ref={combinedRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'group relative flex items-center gap-3 p-3 rounded-lg cursor-grab transition-smooth',
          'bg-muted/50 hover:bg-accent border border-transparent hover:border-border',
          tab.active && 'ring-2 ring-primary',
          isHighlighted && 'bg-accent border-primary',
          isDimmed && 'opacity-40',
          isDragging && 'opacity-50 cursor-grabbing shadow-lg z-50'
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
          className="w-5 h-5 flex-shrink-0 rounded"
          onError={handleFaviconError}
        />

        {/* Title */}
        <span className="text-sm text-card-foreground truncate flex-1 min-w-0">{tab.title}</span>

        {/* Active indicator */}
        {tab.active && (
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
        )}
      </div>

      {/* Tooltip */}
      {isHovered && !isDragging && (
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
