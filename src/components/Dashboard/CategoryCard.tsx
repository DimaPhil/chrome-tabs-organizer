import { type MouseEvent, useState } from 'react';
import type { Tab, Category } from '@/types';
import { TabCompact } from '@/components/Tab/TabCompact';
import { TabContextMenu } from '@/components/Tab/TabContextMenu';
import { useCategories, useTabs } from '@/hooks';
import { cn } from '@/utils';

interface CategoryCardProps {
  category: Category;
  tabs: Tab[];
  allCategories: Category[];
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onClick: () => void;
  isDropTarget?: boolean;
}

export function CategoryCard({
  category,
  tabs,
  allCategories,
  searchQuery,
  highlightedTabIds,
  onClick,
  isDropTarget,
}: CategoryCardProps) {
  const { switchToTab, closeTab, pinTab } = useTabs();
  const { moveTabToCategory } = useCategories();

  const [contextMenu, setContextMenu] = useState<{
    tab: Tab;
    position: { x: number; y: number };
  } | null>(null);

  const handleTabClick = async (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    await switchToTab(tab.id);
  };

  const handleContextMenu = (e: MouseEvent, tab: Tab) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ tab, position: { x: e.clientX, y: e.clientY } });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleSwitchTo = async () => {
    if (contextMenu) {
      await switchToTab(contextMenu.tab.id);
      closeContextMenu();
    }
  };

  const handleOpenNew = async () => {
    if (contextMenu) {
      window.open(contextMenu.tab.url, '_blank');
      closeContextMenu();
    }
  };

  const handleCloseTab = async () => {
    if (contextMenu) {
      await closeTab(contextMenu.tab.id);
      closeContextMenu();
    }
  };

  const handlePin = async () => {
    if (contextMenu) {
      await pinTab(contextMenu.tab.id, !contextMenu.tab.pinned);
      closeContextMenu();
    }
  };

  const handleMoveToCategory = async (categoryId: string) => {
    if (contextMenu) {
      await moveTabToCategory(contextMenu.tab.id, categoryId);
      closeContextMenu();
    }
  };

  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  const isEmpty = tabs.length === 0;

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border p-4 transition-smooth cursor-pointer',
        'hover:border-primary/50 hover:shadow-lg',
        isDropTarget && 'border-primary border-2 bg-accent',
        isEmpty && 'min-h-[80px]'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-card-foreground">{category.name}</h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tabs.length}
        </span>
      </div>

      {/* Tabs grid */}
      {isEmpty ? (
        <div className="text-sm text-muted-foreground text-center py-4">No tabs</div>
      ) : (
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
          {tabs.slice(0, 6).map((tab) => {
            const isHighlighted = highlightedTabIds?.has(tab.id);
            const isDimmed = hasSearch && !isHighlighted;

            return (
              <TabCompact
                key={tab.id}
                tab={tab}
                isHighlighted={isHighlighted || false}
                isDimmed={isDimmed || false}
                onClick={(t) =>
                  handleTabClick({ stopPropagation: () => {} } as React.MouseEvent, t)
                }
                onContextMenu={handleContextMenu}
              />
            );
          })}
        </div>
      )}

      {/* Show more indicator */}
      {tabs.length > 6 && (
        <div className="mt-3 text-center text-sm text-muted-foreground">
          +{tabs.length - 6} more
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          categories={allCategories}
          currentCategoryId={category.id}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onSwitchTo={handleSwitchTo}
          onOpenNew={handleOpenNew}
          onCloseTab={handleCloseTab}
          onPin={handlePin}
          onMoveToCategory={handleMoveToCategory}
        />
      )}
    </div>
  );
}
