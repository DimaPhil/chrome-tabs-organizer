import { useMemo, useCallback, useState } from 'react';
import { useAppContext } from '@/store';
import { actions } from '@/store/actions';
import { useCategories, useTabs, useEscapeKey } from '@/hooks';
import { DragDropDashboard } from '@/components/DragDrop/DragDropDashboard';
import { CategoryView, CategoryManager } from '@/components/Category';
import { SearchBar } from '@/components/Search/SearchBar';
import { Breadcrumb } from '@/components/Navigation/Breadcrumb';
import { Button } from '@/components/common';

export function Dashboard() {
  const { state, dispatch, getTabsByCategory, getFilteredTabs } = useAppContext();
  const { sortedCategories } = useCategories();
  const { tabs } = useTabs();

  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const tabsByCategory = getTabsByCategory();
  const filteredTabs = getFilteredTabs();
  const currentView = state.currentView;
  const searchQuery = state.searchQuery;

  // Create set of highlighted tab IDs for search
  const highlightedTabIds = useMemo(() => {
    if (!searchQuery.trim()) return undefined;
    return new Set(filteredTabs.map((t) => t.id));
  }, [searchQuery, filteredTabs]);

  // Get current category if in single-category view
  const currentCategory = useMemo(() => {
    if (currentView === 'all') return undefined;
    return sortedCategories.find((c) => c.id === currentView.categoryId);
  }, [currentView, sortedCategories]);

  // Navigation handlers
  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      dispatch(actions.setCurrentView({ categoryId }));
    },
    [dispatch]
  );

  const handleNavigateHome = useCallback(() => {
    dispatch(actions.setCurrentView('all'));
    dispatch(actions.setSearchQuery(''));
  }, [dispatch]);

  // Search handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(actions.setSearchQuery(value));
    },
    [dispatch]
  );

  const handleSearchClear = useCallback(() => {
    dispatch(actions.setSearchQuery(''));
  }, [dispatch]);

  // Escape key to go back
  useEscapeKey(() => {
    if (showCategoryManager) {
      setShowCategoryManager(false);
    } else if (currentView !== 'all') {
      handleNavigateHome();
    } else if (searchQuery) {
      handleSearchClear();
    }
  });

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading tabs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Tabs Organizer</h1>
            <Breadcrumb currentCategory={currentCategory} onNavigateHome={handleNavigateHome} />
          </div>
          <div className="flex items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
            />
            <Button
              variant="secondary"
              onClick={() => setShowCategoryManager(true)}
              title="Manage categories"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>{tabs.length} tabs</span>
          <span>•</span>
          <span>{sortedCategories.length} categories</span>
          {searchQuery && (
            <>
              <span>•</span>
              <span>{filteredTabs.length} matches</span>
            </>
          )}
        </div>

        {/* Main content */}
        {currentView === 'all' ? (
          <DragDropDashboard
            categories={sortedCategories}
            tabsByCategory={tabsByCategory}
            searchQuery={searchQuery}
            highlightedTabIds={highlightedTabIds}
            onCategoryClick={handleCategoryClick}
          />
        ) : currentCategory ? (
          <CategoryView
            category={currentCategory}
            tabs={tabsByCategory.get(currentCategory.id) || []}
            allCategories={sortedCategories}
            searchQuery={searchQuery}
            highlightedTabIds={highlightedTabIds}
            onBack={handleNavigateHome}
          />
        ) : (
          <div className="text-center text-muted-foreground py-12">Category not found</div>
        )}
      </div>

      {/* Category Manager Modal */}
      <CategoryManager isOpen={showCategoryManager} onClose={() => setShowCategoryManager(false)} />
    </div>
  );
}
