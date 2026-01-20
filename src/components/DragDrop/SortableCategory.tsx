import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type MouseEvent } from 'react';
import type { Tab, Category } from '@/types';
import { DraggableTab } from './DraggableTab';
import { cn } from '@/utils';

interface SortableCategoryProps {
  category: Category;
  tabs: Tab[];
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onTabClick: (tab: Tab) => void;
  onTabContextMenu: (e: MouseEvent, tab: Tab) => void;
  onCategoryClick: () => void;
  isDraggingCategory?: boolean;
}

export function SortableCategory({
  category,
  tabs,
  searchQuery,
  highlightedTabIds,
  onTabClick,
  onTabContextMenu,
  onCategoryClick,
  isDraggingCategory,
}: SortableCategoryProps) {
  // Make the category sortable (for reordering categories)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isCategoryDragging,
  } = useSortable({
    id: `category-${category.id}`,
    data: { type: 'category', category },
  });

  // Make the category droppable (for receiving tabs)
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `drop-${category.id}`,
    data: { type: 'category-drop', categoryId: category.id },
  });

  // Combine refs
  const setNodeRef = (node: HTMLDivElement | null) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  const isEmpty = tabs.length === 0;

  const tabIds = tabs.map((t) => `tab-${t.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card rounded-xl border border-border p-5 transition-smooth',
        isOver && 'border-primary border-2 bg-accent',
        isCategoryDragging && 'opacity-50 shadow-2xl scale-[1.02]',
        isDraggingCategory && !isCategoryDragging && 'opacity-75',
        isEmpty && 'min-h-[140px]'
      )}
    >
      {/* Header - draggable handle for category */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing select-none"
        onClick={() => {
          // Only trigger click if not dragging
          if (!isCategoryDragging) {
            onCategoryClick();
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div className="text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">{category.name}</h3>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tabs.length}
        </span>
      </div>

      {/* Tabs */}
      {isEmpty ? (
        <div
          className={cn(
            'text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg',
            isOver ? 'border-primary bg-accent' : 'border-border'
          )}
        >
          {isOver ? 'Drop tab here' : 'No tabs - drag tabs here'}
        </div>
      ) : (
        <SortableContext items={tabIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tabs.slice(0, 6).map((tab) => {
              const isHighlighted = highlightedTabIds?.has(tab.id);
              const isDimmed = hasSearch && !isHighlighted;

              return (
                <DraggableTab
                  key={tab.id}
                  tab={tab}
                  categoryId={category.id}
                  isHighlighted={isHighlighted || false}
                  isDimmed={isDimmed || false}
                  onClick={onTabClick}
                  onContextMenu={onTabContextMenu}
                />
              );
            })}
          </div>
        </SortableContext>
      )}

      {/* Show more indicator */}
      {tabs.length > 6 && (
        <div
          className="mt-3 text-center text-sm text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={onCategoryClick}
        >
          +{tabs.length - 6} more - click to expand
        </div>
      )}
    </div>
  );
}
