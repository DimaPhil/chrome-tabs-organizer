import { type MouseEvent, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Tab, Category } from '@/types';
import { SortableTabExpanded } from '@/components/Tab/SortableTabExpanded';
import { TabExpanded } from '@/components/Tab/TabExpanded';
import { TabContextMenu } from '@/components/Tab/TabContextMenu';
import { useCategories, useTabs } from '@/hooks';
import { useAppContext } from '@/store';
import { storageService } from '@/services';
import { actions } from '@/store/actions';

interface CategoryViewProps {
  category: Category;
  tabs: Tab[];
  allCategories: Category[];
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onBack: () => void;
}

export function CategoryView({
  category,
  tabs,
  allCategories,
  searchQuery,
  highlightedTabIds,
  onBack,
}: CategoryViewProps) {
  const { switchToTab, closeTab, pinTab } = useTabs();
  const { moveTabToCategory } = useCategories();
  const { dispatch } = useAppContext();

  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    tab: Tab;
    position: { x: number; y: number };
  } | null>(null);

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
      setActiveTab(data.tab);
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTab(null);

      if (!over || active.id === over.id) return;

      const activeIndex = tabs.findIndex((t) => `tab-${t.id}` === active.id);
      const overIndex = tabs.findIndex((t) => `tab-${t.id}` === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newTabs = arrayMove(tabs, activeIndex, overIndex);

        // Save the new order to state and storage
        const tabIds = newTabs.map((t) => t.id);
        dispatch(actions.setTabOrder(category.id, tabIds));
        await storageService.updateTabOrder(category.id, tabIds);
      }
    },
    [tabs, category.id, dispatch]
  );

  const handleTabClick = async (tab: Tab) => {
    await switchToTab(tab.id);
  };

  const handleContextMenu = (e: MouseEvent, tab: Tab) => {
    e.preventDefault();
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
  const tabIds = tabs.map((t) => `tab-${t.id}`);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-smooth">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
        <span className="text-muted-foreground">({tabs.length} tabs)</span>
        <span className="text-xs text-muted-foreground ml-auto">Drag to reorder</span>
      </div>

      {/* Tabs grid with DnD */}
      <div className="flex-1 overflow-auto">
        {tabs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No tabs in this category
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tabIds} strategy={rectSortingStrategy}>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tabs.map((tab) => {
                  const isHighlighted = highlightedTabIds?.has(tab.id);
                  const isDimmed = hasSearch && !isHighlighted;

                  return (
                    <SortableTabExpanded
                      key={tab.id}
                      tab={tab}
                      isHighlighted={isHighlighted || false}
                      isDimmed={isDimmed || false}
                      onClick={handleTabClick}
                      onContextMenu={handleContextMenu}
                    />
                  );
                })}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTab && (
                <div className="opacity-90 shadow-2xl">
                  <TabExpanded tab={activeTab} onClick={() => {}} onContextMenu={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

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
