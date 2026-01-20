import type { Tab } from '@/types';

class TabService {
  async getTabs(): Promise<Tab[]> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_TABS' }, (response) => {
        if (response?.tabs) {
          resolve(response.tabs.map(this.mapChromeTab));
        } else {
          // Fallback to direct API call
          chrome.tabs.query({ currentWindow: true }, (tabs) => {
            resolve(tabs.map(this.mapChromeTab));
          });
        }
      });
    });
  }

  private mapChromeTab(tab: chrome.tabs.Tab): Tab {
    // lastAccessed requires "tabs" permission and may not be in type definitions
    const extendedTab = tab as chrome.tabs.Tab & { lastAccessed?: number };
    return {
      id: tab.id!,
      windowId: tab.windowId!,
      title: tab.title || 'Untitled',
      url: tab.url || '',
      favIconUrl: tab.favIconUrl,
      pinned: tab.pinned || false,
      active: tab.active || false,
      lastAccessed: extendedTab.lastAccessed,
      index: tab.index,
    };
  }

  async switchToTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'SWITCH_TO_TAB', tabId }, () => {
        resolve();
      });
    });
  }

  async closeTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB', tabId }, () => {
        resolve();
      });
    });
  }

  async pinTab(tabId: number, pinned: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'PIN_TAB', tabId, pinned }, () => {
        resolve();
      });
    });
  }

  async createTab(url: string): Promise<Tab> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'CREATE_TAB', url }, (response) => {
        resolve(this.mapChromeTab(response.tab));
      });
    });
  }

  onTabCreated(callback: (tab: Tab) => void): () => void {
    const listener = (message: { type: string; tab?: chrome.tabs.Tab }) => {
      if (message.type === 'TAB_CREATED' && message.tab) {
        callback(this.mapChromeTab(message.tab));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }

  onTabRemoved(callback: (tabId: number, windowId: number) => void): () => void {
    const listener = (message: { type: string; tabId?: number; windowId?: number }) => {
      if (message.type === 'TAB_REMOVED' && message.tabId !== undefined) {
        callback(message.tabId, message.windowId!);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }

  onTabUpdated(callback: (tabId: number, tab: Tab) => void): () => void {
    const listener = (message: { type: string; tabId?: number; tab?: chrome.tabs.Tab }) => {
      if (message.type === 'TAB_UPDATED' && message.tab) {
        callback(message.tabId!, this.mapChromeTab(message.tab));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }

  onTabActivated(callback: (tabId: number, windowId: number) => void): () => void {
    const listener = (message: { type: string; tabId?: number; windowId?: number }) => {
      if (message.type === 'TAB_ACTIVATED' && message.tabId !== undefined) {
        callback(message.tabId, message.windowId!);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }
}

export const tabService = new TabService();
