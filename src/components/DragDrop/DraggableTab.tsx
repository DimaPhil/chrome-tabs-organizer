import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type MouseEvent } from 'react';
import type { Tab } from '@/types';
import { cn, FALLBACK_FAVICON, handleFaviconError } from '@/utils';
import { useTooltipPosition } from '@/hooks';
import { PinnedIndicator, TabTooltip } from '@/components/Tab';

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
  const { isVisible, position, elementRef, handlers } = useTooltipPosition();

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
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
      >
        {tab.pinned && <PinnedIndicator size="sm" />}

        <img
          src={tab.favIconUrl || FALLBACK_FAVICON}
          alt=""
          className="w-5 h-5 flex-shrink-0 rounded"
          onError={handleFaviconError}
        />

        <span className="text-sm text-card-foreground truncate flex-1 min-w-0">{tab.title}</span>

        {tab.active && (
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Active tab" />
        )}
      </div>

      {isVisible && !isDragging && (
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
