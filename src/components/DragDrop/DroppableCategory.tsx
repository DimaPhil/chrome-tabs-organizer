import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type MouseEvent, type ReactNode } from 'react';
import type { Tab, Category } from '@/types';
import { DraggableTab } from './DraggableTab';
import { cn } from '@/utils';

interface DroppableCategoryProps {
  category: Category;
  tabs: Tab[];
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onTabClick: (tab: Tab) => void;
  onTabContextMenu: (e: MouseEvent, tab: Tab) => void;
  onCategoryClick: () => void;
  children?: ReactNode;
}

export function DroppableCategory({
  category,
  tabs,
  searchQuery,
  highlightedTabIds,
  onTabClick,
  onTabContextMenu,
  onCategoryClick,
}: DroppableCategoryProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `category-${category.id}`,
    data: { type: 'category', categoryId: category.id },
  });

  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  const isEmpty = tabs.length === 0;

  const tabIds = tabs.map((t) => t.id.toString());

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-card rounded-xl border border-border p-4 transition-smooth',
        isOver && 'border-primary border-2 bg-accent',
        isEmpty && 'min-h-[100px]'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-3 cursor-pointer hover:opacity-80"
        onClick={onCategoryClick}
      >
        <h3 className="text-lg font-semibold text-card-foreground">{category.name}</h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tabs.length}
        </span>
      </div>

      {/* Tabs */}
      {isEmpty ? (
        <div
          className={cn(
            'text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg',
            isOver ? 'border-primary bg-accent' : 'border-border'
          )}
        >
          {isOver ? 'Drop here' : 'No tabs - drag tabs here'}
        </div>
      ) : (
        <SortableContext items={tabIds} strategy={verticalListSortingStrategy}>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
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
