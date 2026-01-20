export interface Category {
  id: string;
  name: string;
  order: number;
  isDefault?: boolean; // Default categories can't be deleted
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', order: 0, isDefault: true },
  { id: 'ai', name: 'AI', order: 1, isDefault: true },
  { id: 'trading', name: 'Trading', order: 2, isDefault: true },
  { id: 'social', name: 'Social', order: 3, isDefault: true },
  { id: 'entertainment', name: 'Entertainment', order: 4, isDefault: true },
  { id: 'learning', name: 'Learning', order: 5, isDefault: true },
  { id: 'uncategorized', name: 'Uncategorized', order: 6, isDefault: true },
];

export const UNCATEGORIZED_ID = 'uncategorized';
