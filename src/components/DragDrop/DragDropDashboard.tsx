import { useState, useCallback, useRef, type MouseEvent, type KeyboardEvent } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Tab, Category } from '@/types';
import { useCategories, useTabs } from '@/hooks';
import { SortableCategory } from './SortableCategory';
import { TabCompact } from '@/components/Tab/TabCompact';
import { TabContextMenu } from '@/components/Tab/TabContextMenu';

interface DragDropDashboardProps {
  categories: Category[];
  tabsByCategory: Map<string, Tab[]>;
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onCategoryClick: (categoryId: string) => void;
}

type DragItem =
  | { type: 'tab'; tab: Tab; categoryId: string }
  | { type: 'category'; category: Category };

// Custom collision detection that prefers drop zones for tabs
const customCollisionDetection: CollisionDetection = (args) => {
  // First check pointerWithin for more precise detection
  const pointerCollisions = pointerWithin(args);

  // If dragging a tab, prefer category drop zones
  const activeData = args.active.data.current;
  if (activeData?.type === 'tab') {
    // Prefer drop zones (categories where tabs can be dropped)
    const dropZoneCollision = pointerCollisions.find(
      (collision) =>
        collision.id.toString().startsWith('drop-') ||
        collision.data?.droppableContainer?.data?.current?.type === 'category-drop'
    );
    if (dropZoneCollision) {
      return [dropZoneCollision];
    }
  }

  // Fall back to rectIntersection for general use
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return rectIntersection(args);
};

export function DragDropDashboard({
  categories,
  tabsByCategory,
  searchQuery,
  highlightedTabIds,
  onCategoryClick,
}: DragDropDashboardProps) {
  const { moveTabToCategory, reorderCategories, sortedCategories, createCategory } =
    useCategories();
  const { switchToTab, closeTab, pinTab } = useTabs();

  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    tab: Tab;
    categoryId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'tab') {
      setActiveItem({ type: 'tab', tab: data.tab, categoryId: data.categoryId });
    } else if (data?.type === 'category') {
      setActiveItem({ type: 'category', category: data.category });
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveItem(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle category reordering
      if (activeData?.type === 'category' && activeId !== overId) {
        if (overId.startsWith('category-')) {
          const activeIndex = categories.findIndex((c) => `category-${c.id}` === activeId);
          const overIndex = categories.findIndex((c) => `category-${c.id}` === overId);

          if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(
              categories.map((c) => c.id),
              activeIndex,
              overIndex
            );
            await reorderCategories(newOrder);
          }
        }
      }

      // Handle tab moving to category
      if (activeData?.type === 'tab') {
        const tabId = activeData.tab.id;
        const sourceCategoryId = activeData.categoryId;
        let targetCategoryId: string | null = null;

        // Dropped on a category drop zone
        if (overData?.type === 'category-drop') {
          targetCategoryId = overData.categoryId;
        }
        // Dropped on another tab - move to that tab's category
        else if (overData?.type === 'tab') {
          targetCategoryId = overData.categoryId;
        }
        // Dropped on a category element (sortable) - extract category ID
        else if (overData?.type === 'category') {
          targetCategoryId = overData.category?.id;
        }
        // Fallback: check overId patterns
        else if (overId.startsWith('drop-')) {
          targetCategoryId = overId.replace('drop-', '');
        } else if (overId.startsWith('category-')) {
          targetCategoryId = overId.replace('category-', '');
        }

        if (targetCategoryId && sourceCategoryId !== targetCategoryId) {
          await moveTabToCategory(tabId, targetCategoryId);
        }
      }
    },
    [categories, moveTabToCategory, reorderCategories]
  );

  const handleTabClick = useCallback(
    async (tab: Tab) => {
      await switchToTab(tab.id);
    },
    [switchToTab]
  );

  const handleTabContextMenu = useCallback((e: MouseEvent, tab: Tab, categoryId: string) => {
    e.preventDefault();
    setContextMenu({ tab, categoryId, position: { x: e.clientX, y: e.clientY } });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleSwitchTo = useCallback(async () => {
    if (contextMenu) {
      await switchToTab(contextMenu.tab.id);
      closeContextMenu();
    }
  }, [contextMenu, switchToTab, closeContextMenu]);

  const handleOpenNew = useCallback(() => {
    if (contextMenu) {
      window.open(contextMenu.tab.url, '_blank');
      closeContextMenu();
    }
  }, [contextMenu, closeContextMenu]);

  const handleCloseTab = useCallback(async () => {
    if (contextMenu) {
      await closeTab(contextMenu.tab.id);
      closeContextMenu();
    }
  }, [contextMenu, closeTab, closeContextMenu]);

  const handlePin = useCallback(async () => {
    if (contextMenu) {
      await pinTab(contextMenu.tab.id, !contextMenu.tab.pinned);
      closeContextMenu();
    }
  }, [contextMenu, pinTab, closeContextMenu]);

  const handleMoveToCategory = useCallback(
    async (categoryId: string) => {
      if (contextMenu) {
        await moveTabToCategory(contextMenu.tab.id, categoryId);
        closeContextMenu();
      }
    },
    [contextMenu, moveTabToCategory, closeContextMenu]
  );

  const handleAddCategoryClick = useCallback(() => {
    setIsAddingCategory(true);
    setNewCategoryName('');
    // Focus input after render
    setTimeout(() => newCategoryInputRef.current?.focus(), 0);
  }, []);

  const handleCreateCategory = useCallback(async () => {
    if (newCategoryName.trim()) {
      await createCategory(newCategoryName.trim());
    }
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, [newCategoryName, createCategory]);

  const handleCancelAddCategory = useCallback(() => {
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, []);

  const handleNewCategoryKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateCategory();
      } else if (e.key === 'Escape') {
        handleCancelAddCategory();
      }
    },
    [handleCreateCategory, handleCancelAddCategory]
  );

  const categoryIds = categories.map((c) => `category-${c.id}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categoryIds} strategy={rectSortingStrategy}>
        {/* Grid with support for up to 3 columns - larger cards for readability */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const categoryTabs = tabsByCategory.get(category.id) || [];

            return (
              <SortableCategory
                key={category.id}
                category={category}
                tabs={categoryTabs}
                searchQuery={searchQuery}
                highlightedTabIds={highlightedTabIds}
                onTabClick={handleTabClick}
                onTabContextMenu={(e, tab) => handleTabContextMenu(e, tab, category.id)}
                onCategoryClick={() => onCategoryClick(category.id)}
                isDraggingCategory={activeItem?.type === 'category'}
              />
            );
          })}

          {/* Add New Category tile */}
          <div
            className={`
              bg-card/50 rounded-xl border-2 border-dashed border-border p-5
              flex flex-col items-center justify-center min-h-[140px]
              cursor-pointer transition-all duration-200
              hover:bg-card/80 hover:border-primary/50
              ${isAddingCategory ? 'bg-card border-primary' : ''}
            `}
            onClick={!isAddingCategory ? handleAddCategoryClick : undefined}
          >
            {isAddingCategory ? (
              <div className="w-full space-y-3">
                <input
                  ref={newCategoryInputRef}
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleNewCategoryKeyDown}
                  onBlur={handleCancelAddCategory}
                  placeholder="Category name..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Press Enter to create, Esc to cancel
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-muted-foreground font-medium">Add New Category</span>
              </>
            )}
          </div>
        </div>
      </SortableContext>

      {/* Drag overlay */}
      <DragOverlay>
        {activeItem?.type === 'tab' && (
          <div className="opacity-90 shadow-2xl">
            <TabCompact
              tab={activeItem.tab}
              showTooltip={false}
              onClick={() => {}}
              onContextMenu={() => {}}
            />
          </div>
        )}
        {activeItem?.type === 'category' && (
          <div className="bg-card rounded-xl border-2 border-primary p-4 opacity-90 shadow-2xl min-w-[300px]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">
                {activeItem.category.name}
              </h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {tabsByCategory.get(activeItem.category.id)?.length || 0}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Context menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          categories={sortedCategories}
          currentCategoryId={contextMenu.categoryId}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onSwitchTo={handleSwitchTo}
          onOpenNew={handleOpenNew}
          onCloseTab={handleCloseTab}
          onPin={handlePin}
          onMoveToCategory={handleMoveToCategory}
        />
      )}
    </DndContext>
  );
}
