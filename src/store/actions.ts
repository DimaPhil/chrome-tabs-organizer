import type { Tab, Category, StorageData } from '@/types';

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TABS'; payload: Tab[] }
  | { type: 'ADD_TAB'; payload: Tab }
  | { type: 'REMOVE_TAB'; payload: number }
  | { type: 'UPDATE_TAB'; payload: { tabId: number; tab: Tab } }
  | { type: 'SET_ACTIVE_TAB'; payload: number }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'REORDER_CATEGORIES'; payload: string[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Map<string, string> }
  | { type: 'SET_ASSIGNMENT'; payload: { url: string; categoryId: string } }
  | { type: 'REMOVE_ASSIGNMENT'; payload: string }
  | { type: 'SET_CURRENT_VIEW'; payload: 'all' | { categoryId: string } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_STORAGE'; payload: StorageData }
  | { type: 'SET_TAB_ORDER'; payload: { categoryId: string; tabIds: number[] } };

// Action creators
export const actions = {
  setLoading: (loading: boolean): AppAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  setTabs: (tabs: Tab[]): AppAction => ({
    type: 'SET_TABS',
    payload: tabs,
  }),

  addTab: (tab: Tab): AppAction => ({
    type: 'ADD_TAB',
    payload: tab,
  }),

  removeTab: (tabId: number): AppAction => ({
    type: 'REMOVE_TAB',
    payload: tabId,
  }),

  updateTab: (tabId: number, tab: Tab): AppAction => ({
    type: 'UPDATE_TAB',
    payload: { tabId, tab },
  }),

  setActiveTab: (tabId: number): AppAction => ({
    type: 'SET_ACTIVE_TAB',
    payload: tabId,
  }),

  setCategories: (categories: Category[]): AppAction => ({
    type: 'SET_CATEGORIES',
    payload: categories,
  }),

  addCategory: (category: Category): AppAction => ({
    type: 'ADD_CATEGORY',
    payload: category,
  }),

  updateCategory: (category: Category): AppAction => ({
    type: 'UPDATE_CATEGORY',
    payload: category,
  }),

  deleteCategory: (categoryId: string): AppAction => ({
    type: 'DELETE_CATEGORY',
    payload: categoryId,
  }),

  reorderCategories: (categoryIds: string[]): AppAction => ({
    type: 'REORDER_CATEGORIES',
    payload: categoryIds,
  }),

  setAssignments: (assignments: Map<string, string>): AppAction => ({
    type: 'SET_ASSIGNMENTS',
    payload: assignments,
  }),

  setAssignment: (url: string, categoryId: string): AppAction => ({
    type: 'SET_ASSIGNMENT',
    payload: { url, categoryId },
  }),

  removeAssignment: (url: string): AppAction => ({
    type: 'REMOVE_ASSIGNMENT',
    payload: url,
  }),

  setCurrentView: (view: 'all' | { categoryId: string }): AppAction => ({
    type: 'SET_CURRENT_VIEW',
    payload: view,
  }),

  setSearchQuery: (query: string): AppAction => ({
    type: 'SET_SEARCH_QUERY',
    payload: query,
  }),

  loadStorage: (data: StorageData): AppAction => ({
    type: 'LOAD_STORAGE',
    payload: data,
  }),

  setTabOrder: (categoryId: string, tabIds: number[]): AppAction => ({
    type: 'SET_TAB_ORDER',
    payload: { categoryId, tabIds },
  }),
};
