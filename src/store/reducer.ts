import type { Tab, Category } from '@/types';
import { UNCATEGORIZED_ID, DEFAULT_CATEGORIES } from '@/types/category';
import type { AppAction } from './actions';

export interface AppState {
  loading: boolean;
  tabs: Tab[];
  categories: Category[];
  assignments: Map<string, string>; // url → categoryId (URL is the key for persistence)
  tabOrder: Map<string, number[]>; // categoryId → ordered tab IDs
  categoryOrder: string[];
  currentView: 'all' | { categoryId: string };
  searchQuery: string;
}

export const initialState: AppState = {
  loading: true,
  tabs: [],
  categories: DEFAULT_CATEGORIES,
  assignments: new Map(),
  tabOrder: new Map(),
  categoryOrder: DEFAULT_CATEGORIES.map((c) => c.id),
  currentView: 'all',
  searchQuery: '',
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_TABS':
      return { ...state, tabs: action.payload };

    case 'ADD_TAB':
      return { ...state, tabs: [...state.tabs, action.payload] };

    case 'REMOVE_TAB': {
      // Note: We don't remove the URL assignment when tab is closed
      // This allows the category to persist when the same URL is opened again
      return {
        ...state,
        tabs: state.tabs.filter((t) => t.id !== action.payload),
      };
    }

    case 'UPDATE_TAB': {
      return {
        ...state,
        tabs: state.tabs.map((t) => (t.id === action.payload.tabId ? action.payload.tab : t)),
      };
    }

    case 'SET_ACTIVE_TAB': {
      return {
        ...state,
        tabs: state.tabs.map((t) => ({
          ...t,
          active: t.id === action.payload,
        })),
      };
    }

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
        categoryOrder: [...state.categoryOrder, action.payload.id],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };

    case 'DELETE_CATEGORY': {
      // Move all tabs from deleted category to uncategorized
      const newAssignments = new Map(state.assignments);
      for (const [tabId, categoryId] of newAssignments) {
        if (categoryId === action.payload) {
          newAssignments.set(tabId, UNCATEGORIZED_ID);
        }
      }
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        categoryOrder: state.categoryOrder.filter((id) => id !== action.payload),
        assignments: newAssignments,
      };
    }

    case 'REORDER_CATEGORIES':
      return { ...state, categoryOrder: action.payload };

    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };

    case 'SET_ASSIGNMENT': {
      const newAssignments = new Map(state.assignments);
      newAssignments.set(action.payload.url, action.payload.categoryId);
      return { ...state, assignments: newAssignments };
    }

    case 'REMOVE_ASSIGNMENT': {
      const newAssignments = new Map(state.assignments);
      newAssignments.delete(action.payload); // URL
      return { ...state, assignments: newAssignments };
    }

    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'LOAD_STORAGE': {
      const assignments = new Map<string, string>();
      for (const a of action.payload.assignments) {
        assignments.set(a.url, a.categoryId);
      }

      const tabOrder = new Map<string, number[]>();
      for (const [categoryId, tabIds] of Object.entries(action.payload.tabOrder)) {
        tabOrder.set(categoryId, tabIds);
      }

      return {
        ...state,
        categories:
          action.payload.categories.length > 0 ? action.payload.categories : DEFAULT_CATEGORIES,
        categoryOrder:
          action.payload.categoryOrder.length > 0
            ? action.payload.categoryOrder
            : DEFAULT_CATEGORIES.map((c) => c.id),
        assignments,
        tabOrder,
      };
    }

    case 'SET_TAB_ORDER': {
      const newTabOrder = new Map(state.tabOrder);
      newTabOrder.set(action.payload.categoryId, action.payload.tabIds);
      return { ...state, tabOrder: newTabOrder };
    }

    default:
      return state;
  }
}
