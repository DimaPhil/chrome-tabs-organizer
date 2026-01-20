import { useCallback } from 'react';
import { useAppContext } from '@/store';
import type { Category } from '@/types';

export function useCategories() {
  const {
    state,
    getSortedCategories,
    createCategory,
    renameCategory,
    deleteCategory,
    reorderCategories,
    moveTabToCategory,
  } = useAppContext();

  const categories = state.categories;
  const sortedCategories = getSortedCategories();
  const assignments = state.assignments;

  const handleCreateCategory = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      await createCategory(name.trim());
    },
    [createCategory]
  );

  const handleRenameCategory = useCallback(
    async (categoryId: string, name: string) => {
      if (!name.trim()) return;
      await renameCategory(categoryId, name.trim());
    },
    [renameCategory]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category || category.isDefault) return;
      await deleteCategory(categoryId);
    },
    [categories, deleteCategory]
  );

  const handleReorderCategories = useCallback(
    async (categoryIds: string[]) => {
      await reorderCategories(categoryIds);
    },
    [reorderCategories]
  );

  const handleMoveTabToCategory = useCallback(
    async (tabId: number, categoryId: string) => {
      await moveTabToCategory(tabId, categoryId);
    },
    [moveTabToCategory]
  );

  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined => {
      return categories.find((c) => c.id === categoryId);
    },
    [categories]
  );

  const getTabCategory = useCallback(
    (url: string): string | undefined => {
      return assignments.get(url);
    },
    [assignments]
  );

  return {
    categories,
    sortedCategories,
    createCategory: handleCreateCategory,
    renameCategory: handleRenameCategory,
    deleteCategory: handleDeleteCategory,
    reorderCategories: handleReorderCategories,
    moveTabToCategory: handleMoveTabToCategory,
    getCategoryById,
    getTabCategory,
  };
}
