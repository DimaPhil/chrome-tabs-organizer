import type { Category } from './category';

export interface TabCategoryAssignment {
  url: string; // URL is the primary key (tab IDs change between sessions)
  categoryId: string;
  assignedAt: number;
}

export interface UrlCategoryMemory {
  urlPattern: string;
  categoryId: string;
}

export interface StorageData {
  categories: Category[];
  assignments: TabCategoryAssignment[];
  urlMemory: UrlCategoryMemory[];
  tabOrder: Record<string, number[]>; // categoryId -> ordered tab IDs
  categoryOrder: string[]; // ordered category IDs
}

export interface UserPreferences {
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
}

export const DEFAULT_STORAGE_DATA: StorageData = {
  categories: [],
  assignments: [],
  urlMemory: [],
  tabOrder: {},
  categoryOrder: [],
};
