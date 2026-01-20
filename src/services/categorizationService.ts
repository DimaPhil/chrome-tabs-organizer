import type { Tab, Category } from '@/types';
import { UNCATEGORIZED_ID } from '@/types/category';

// Strategy pattern for future extensibility
export interface CategorizationStrategy {
  categorize(tab: Tab, categories: Category[]): string | null;
}

// Manual categorization - returns null, letting the system use stored assignments
export class ManualCategorization implements CategorizationStrategy {
  categorize(_tab: Tab, _categories: Category[]): string | null {
    return null;
  }
}

// Rule-based categorization (extensible for future)
export class RuleBasedCategorization implements CategorizationStrategy {
  private rules: Array<{ pattern: RegExp; categoryId: string }> = [];

  addRule(pattern: RegExp, categoryId: string): void {
    this.rules.push({ pattern, categoryId });
  }

  categorize(tab: Tab, _categories: Category[]): string | null {
    for (const rule of this.rules) {
      if (rule.pattern.test(tab.url) || rule.pattern.test(tab.title)) {
        return rule.categoryId;
      }
    }
    return null;
  }
}

class CategorizationService {
  private strategies: CategorizationStrategy[] = [];

  constructor() {
    // Start with manual categorization only
    this.strategies = [new ManualCategorization()];
  }

  addStrategy(strategy: CategorizationStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Determines the category for a tab.
   * Returns the first non-null result from strategies, or UNCATEGORIZED_ID.
   */
  categorize(tab: Tab, categories: Category[]): string {
    for (const strategy of this.strategies) {
      const result = strategy.categorize(tab, categories);
      if (result) {
        return result;
      }
    }
    return UNCATEGORIZED_ID;
  }

  /**
   * Groups tabs by category.
   * assignments is a Map<url, categoryId>
   * tabOrder is a Map<categoryId, tabIds[]> for custom ordering
   */
  groupTabsByCategory(
    tabs: Tab[],
    categories: Category[],
    assignments: Map<string, string>,
    tabOrder?: Map<string, number[]>
  ): Map<string, Tab[]> {
    const grouped = new Map<string, Tab[]>();

    // Initialize all categories with empty arrays
    for (const category of categories) {
      grouped.set(category.id, []);
    }

    // Assign tabs to categories based on URL
    for (const tab of tabs) {
      const categoryId = assignments.get(tab.url) ?? UNCATEGORIZED_ID;
      const categoryTabs = grouped.get(categoryId);

      if (categoryTabs) {
        categoryTabs.push(tab);
      } else {
        // Category doesn't exist, put in uncategorized
        const uncategorized = grouped.get(UNCATEGORIZED_ID) ?? [];
        uncategorized.push(tab);
        grouped.set(UNCATEGORIZED_ID, uncategorized);
      }
    }

    // Sort tabs within each category
    for (const [categoryId, categoryTabs] of grouped) {
      const customOrder = tabOrder?.get(categoryId);

      if (customOrder && customOrder.length > 0) {
        // Use custom order if available
        const orderMap = new Map(customOrder.map((id, index) => [id, index]));
        categoryTabs.sort((a, b) => {
          // Pinned tabs first
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
          }
          // Then by custom order (tabs not in order go to end)
          const aOrder = orderMap.get(a.id) ?? Infinity;
          const bOrder = orderMap.get(b.id) ?? Infinity;
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          // Fallback to Chrome index
          return a.index - b.index;
        });
      } else {
        // Default sort: pinned first, then by Chrome index
        categoryTabs.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
          }
          return a.index - b.index;
        });
      }

      grouped.set(categoryId, categoryTabs);
    }

    return grouped;
  }
}

export const categorizationService = new CategorizationService();
