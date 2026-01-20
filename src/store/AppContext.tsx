import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import { appReducer, initialState, type AppState } from './reducer';
import { actions, type AppAction } from './actions';
import { storageService, tabService, categorizationService } from '@/services';
import type { Tab, Category } from '@/types';
import { UNCATEGORIZED_ID } from '@/types/category';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  // Computed values
  getTabsByCategory: () => Map<string, Tab[]>;
  getSortedCategories: () => Category[];
  getFilteredTabs: () => Tab[];
  // Actions
  moveTabToCategory: (tabId: number, categoryId: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  renameCategory: (categoryId: string, name: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
  switchToTab: (tabId: number) => Promise<void>;
  closeTab: (tabId: number) => Promise<void>;
  pinTab: (tabId: number, pinned: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initial data loading
  useEffect(() => {
    async function initialize() {
      try {
        // Load storage data
        const storageData = await storageService.load();
        dispatch(actions.loadStorage(storageData));

        // Load tabs
        const tabs = await tabService.getTabs();
        dispatch(actions.setTabs(tabs));

        // Assign uncategorized tabs based on stored assignment or default
        const newAssignments: Array<{ url: string; categoryId: string }> = [];
        for (const tab of tabs) {
          const existingAssignment = storageData.assignments.find((a) => a.url === tab.url);
          if (!existingAssignment) {
            // New tab URL - assign to uncategorized
            const categoryId = UNCATEGORIZED_ID;
            newAssignments.push({ url: tab.url, categoryId });
          }
        }

        // Batch update assignments for new tabs
        for (const { url, categoryId } of newAssignments) {
          dispatch(actions.setAssignment(url, categoryId));
          await storageService.setAssignment(url, categoryId);
        }

        dispatch(actions.setLoading(false));
      } catch (error) {
        console.error('Failed to initialize:', error);
        dispatch(actions.setLoading(false));
      }
    }

    initialize();
  }, []);

  // Tab event listeners
  useEffect(() => {
    const unsubCreated = tabService.onTabCreated(async (tab) => {
      dispatch(actions.addTab(tab));
      // Check if URL already has an assignment (from previous session or moved tab)
      const existingAssignment = await storageService.getAssignment(tab.url);
      const categoryId = existingAssignment ?? UNCATEGORIZED_ID;
      dispatch(actions.setAssignment(tab.url, categoryId));
      if (!existingAssignment) {
        await storageService.setAssignment(tab.url, categoryId);
      }
    });

    const unsubRemoved = tabService.onTabRemoved((tabId) => {
      dispatch(actions.removeTab(tabId));
      // Note: We don't remove URL assignment - it should persist for future tabs with same URL
    });

    const unsubUpdated = tabService.onTabUpdated((tabId, tab) => {
      dispatch(actions.updateTab(tabId, tab));
    });

    const unsubActivated = tabService.onTabActivated((tabId) => {
      dispatch(actions.setActiveTab(tabId));
    });

    return () => {
      unsubCreated();
      unsubRemoved();
      unsubUpdated();
      unsubActivated();
    };
  }, []);

  // Computed: Get tabs grouped by category
  const getTabsByCategory = useCallback((): Map<string, Tab[]> => {
    return categorizationService.groupTabsByCategory(
      state.tabs,
      state.categories,
      state.assignments,
      state.tabOrder
    );
  }, [state.tabs, state.categories, state.assignments, state.tabOrder]);

  // Computed: Get categories in sorted order
  const getSortedCategories = useCallback((): Category[] => {
    const categoryMap = new Map(state.categories.map((c) => [c.id, c]));
    return state.categoryOrder
      .map((id) => categoryMap.get(id))
      .filter((c): c is Category => c !== undefined);
  }, [state.categories, state.categoryOrder]);

  // Computed: Get filtered tabs based on search query
  const getFilteredTabs = useCallback((): Tab[] => {
    if (!state.searchQuery.trim()) {
      return state.tabs;
    }
    const query = state.searchQuery.toLowerCase();
    return state.tabs.filter(
      (tab) => tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)
    );
  }, [state.tabs, state.searchQuery]);

  // Action: Move tab to category
  const moveTabToCategory = useCallback(
    async (tabId: number, categoryId: string) => {
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return;

      dispatch(actions.setAssignment(tab.url, categoryId));
      await storageService.setAssignment(tab.url, categoryId);
    },
    [state.tabs]
  );

  // Action: Create category
  const createCategory = useCallback(
    async (name: string) => {
      const id = `category-${Date.now()}`;
      const order = state.categories.length;
      const category: Category = { id, name, order };
      dispatch(actions.addCategory(category));

      const storageData = await storageService.load();
      storageData.categories.push(category);
      storageData.categoryOrder.push(id);
      await storageService.save(storageData);
    },
    [state.categories.length]
  );

  // Action: Rename category
  const renameCategory = useCallback(
    async (categoryId: string, name: string) => {
      const category = state.categories.find((c) => c.id === categoryId);
      if (!category) return;

      const updated = { ...category, name };
      dispatch(actions.updateCategory(updated));

      const storageData = await storageService.load();
      const index = storageData.categories.findIndex((c) => c.id === categoryId);
      if (index >= 0) {
        storageData.categories[index] = updated;
        await storageService.save(storageData);
      }
    },
    [state.categories]
  );

  // Action: Delete category
  const deleteCategory = useCallback(async (categoryId: string) => {
    dispatch(actions.deleteCategory(categoryId));

    const storageData = await storageService.load();
    storageData.categories = storageData.categories.filter((c) => c.id !== categoryId);
    storageData.categoryOrder = storageData.categoryOrder.filter((id) => id !== categoryId);
    // Move assignments to uncategorized
    storageData.assignments = storageData.assignments.map((a) =>
      a.categoryId === categoryId ? { ...a, categoryId: UNCATEGORIZED_ID } : a
    );
    await storageService.save(storageData);
  }, []);

  // Action: Reorder categories
  const reorderCategories = useCallback(async (categoryIds: string[]) => {
    dispatch(actions.reorderCategories(categoryIds));
    await storageService.updateCategoryOrder(categoryIds);
  }, []);

  // Action: Switch to tab
  const switchToTab = useCallback(async (tabId: number) => {
    await tabService.switchToTab(tabId);
  }, []);

  // Action: Close tab
  const closeTab = useCallback(async (tabId: number) => {
    await tabService.closeTab(tabId);
  }, []);

  // Action: Pin/unpin tab
  const pinTab = useCallback(async (tabId: number, pinned: boolean) => {
    await tabService.pinTab(tabId, pinned);
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    getTabsByCategory,
    getSortedCategories,
    getFilteredTabs,
    moveTabToCategory,
    createCategory,
    renameCategory,
    deleteCategory,
    reorderCategories,
    switchToTab,
    closeTab,
    pinTab,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
