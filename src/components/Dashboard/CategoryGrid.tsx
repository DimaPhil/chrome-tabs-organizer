import type { Tab, Category } from '@/types';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories: Category[];
  tabsByCategory: Map<string, Tab[]>;
  searchQuery?: string;
  highlightedTabIds?: Set<number>;
  onCategoryClick: (categoryId: string) => void;
  dropTargetId?: string | null;
}

export function CategoryGrid({
  categories,
  tabsByCategory,
  searchQuery,
  highlightedTabIds,
  onCategoryClick,
  dropTargetId,
}: CategoryGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => {
        const tabs = tabsByCategory.get(category.id) || [];
        const isDropTarget = dropTargetId === category.id;

        return (
          <CategoryCard
            key={category.id}
            category={category}
            tabs={tabs}
            allCategories={categories}
            searchQuery={searchQuery}
            highlightedTabIds={highlightedTabIds}
            onClick={() => onCategoryClick(category.id)}
            isDropTarget={isDropTarget}
          />
        );
      })}
    </div>
  );
}
