import { useCallback } from 'react';
import { useAppContext } from '@/store';
import type { Tab } from '@/types';

export function useTabs() {
  const { state, switchToTab, closeTab, pinTab, getFilteredTabs, getTabsByCategory } =
    useAppContext();

  const tabs = state.tabs;
  const filteredTabs = getFilteredTabs();
  const tabsByCategory = getTabsByCategory();

  const handleSwitchToTab = useCallback(
    async (tabId: number) => {
      await switchToTab(tabId);
    },
    [switchToTab]
  );

  const handleCloseTab = useCallback(
    async (tabId: number) => {
      await closeTab(tabId);
    },
    [closeTab]
  );

  const handlePinTab = useCallback(
    async (tabId: number, pinned: boolean) => {
      await pinTab(tabId, pinned);
    },
    [pinTab]
  );

  const getTabById = useCallback(
    (tabId: number): Tab | undefined => {
      return tabs.find((t) => t.id === tabId);
    },
    [tabs]
  );

  return {
    tabs,
    filteredTabs,
    tabsByCategory,
    switchToTab: handleSwitchToTab,
    closeTab: handleCloseTab,
    pinTab: handlePinTab,
    getTabById,
  };
}
