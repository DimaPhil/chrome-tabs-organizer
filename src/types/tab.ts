export interface Tab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  pinned: boolean;
  active: boolean;
  lastAccessed?: number;
  index: number;
}

export interface TabWithCategory extends Tab {
  categoryId: string;
}
