import type { StorageData } from '@/types';
import { DEFAULT_STORAGE_DATA } from '@/types';
import { DEFAULT_CATEGORIES } from '@/types/category';

const STORAGE_KEY = 'tabsOrganizerData';

class StorageService {
  // Use local storage by default - sync has 8KB per item limit which is too small
  // for users with many tabs. Local storage has 10MB limit.
  private useLocal: boolean = true;

  private get storage(): chrome.storage.StorageArea {
    return this.useLocal ? chrome.storage.local : chrome.storage.sync;
  }

  async load(): Promise<StorageData> {
    const result = await this.storage.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as StorageData | undefined;

    if (!data) {
      // Initialize with defaults
      const initialData: StorageData = {
        ...DEFAULT_STORAGE_DATA,
        categories: DEFAULT_CATEGORIES,
        categoryOrder: DEFAULT_CATEGORIES.map((c) => c.id),
      };
      await this.save(initialData);
      return initialData;
    }

    return data;
  }

  async save(data: StorageData): Promise<void> {
    await this.storage.set({ [STORAGE_KEY]: data });
  }

  async getAssignment(url: string): Promise<string | null> {
    const data = await this.load();
    const assignment = data.assignments.find((a) => a.url === url);
    return assignment?.categoryId ?? null;
  }

  async setAssignment(url: string, categoryId: string): Promise<void> {
    const data = await this.load();
    const existingIndex = data.assignments.findIndex((a) => a.url === url);

    const assignment = {
      url,
      categoryId,
      assignedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      data.assignments[existingIndex] = assignment;
    } else {
      data.assignments.push(assignment);
    }

    // Limit assignments to prevent quota issues (keep most recent 1000)
    if (data.assignments.length > 1000) {
      data.assignments.sort((a, b) => b.assignedAt - a.assignedAt);
      data.assignments = data.assignments.slice(0, 1000);
    }

    await this.save(data);
  }

  async removeAssignment(url: string): Promise<void> {
    const data = await this.load();
    data.assignments = data.assignments.filter((a) => a.url !== url);
    await this.save(data);
  }

  async getUrlMemory(url: string): Promise<string | null> {
    const data = await this.load();
    // Exact URL match for now
    const memory = data.urlMemory.find((m) => m.urlPattern === url);
    return memory?.categoryId ?? null;
  }

  async setUrlMemory(url: string, categoryId: string): Promise<void> {
    const data = await this.load();
    const existingIndex = data.urlMemory.findIndex((m) => m.urlPattern === url);

    if (existingIndex >= 0) {
      data.urlMemory[existingIndex].categoryId = categoryId;
    } else {
      data.urlMemory.push({ urlPattern: url, categoryId });
    }

    // Limit URL memory to prevent quota issues
    if (data.urlMemory.length > 500) {
      data.urlMemory = data.urlMemory.slice(-500);
    }

    await this.save(data);
  }

  async updateTabOrder(categoryId: string, tabIds: number[]): Promise<void> {
    const data = await this.load();
    data.tabOrder[categoryId] = tabIds;
    await this.save(data);
  }

  async updateCategoryOrder(categoryIds: string[]): Promise<void> {
    const data = await this.load();
    data.categoryOrder = categoryIds;
    await this.save(data);
  }

  onChanged(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if ((this.useLocal && areaName === 'local') || (!this.useLocal && areaName === 'sync')) {
        if (changes[STORAGE_KEY]) {
          callback(changes);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

export const storageService = new StorageService();
