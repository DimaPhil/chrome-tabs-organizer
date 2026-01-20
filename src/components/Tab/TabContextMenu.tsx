import { useEffect, useRef } from 'react';
import type { Tab, Category } from '@/types';

interface TabContextMenuProps {
  tab: Tab;
  categories: Category[];
  currentCategoryId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onSwitchTo: () => void;
  onOpenNew: () => void;
  onCloseTab: () => void;
  onPin: () => void;
  onMoveToCategory: (categoryId: string) => void;
}

export function TabContextMenu({
  tab,
  categories,
  currentCategoryId,
  position,
  onClose,
  onSwitchTo,
  onOpenNew,
  onCloseTab,
  onPin,
  onMoveToCategory,
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${position.x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${position.y - rect.height}px`;
      }
    }
  }, [position]);

  const otherCategories = categories.filter((c) => c.id !== currentCategoryId);

  return (
    <div ref={menuRef} className="context-menu" style={{ left: position.x, top: position.y }}>
      <button className="context-menu-item w-full text-left" onClick={onSwitchTo}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Switch to tab
      </button>

      <button className="context-menu-item w-full text-left" onClick={onOpenNew}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        Open in new tab
      </button>

      <div className="context-menu-divider" />

      <button className="context-menu-item w-full text-left" onClick={onPin}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        {tab.pinned ? 'Unpin tab' : 'Pin tab'}
      </button>

      {otherCategories.length > 0 && (
        <>
          <div className="context-menu-divider" />
          <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Move to...</div>
          {otherCategories.map((category) => (
            <button
              key={category.id}
              className="context-menu-item w-full text-left pl-6"
              onClick={() => onMoveToCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </>
      )}

      <div className="context-menu-divider" />

      <button
        className="context-menu-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onCloseTab}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Close tab
      </button>
    </div>
  );
}
