import { create } from 'zustand';
import { DatabaseFile, Table, PaginationState, SortState, FilterState } from '@/types';

interface AppState {
  files: DatabaseFile[];
  activeFileId: string | null;
  activeTable: Table | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  pagination: PaginationState;
  sort: SortState;
  filter: FilterState;
  setActiveFile: (fileId: string | null) => void;
  setActiveTable: (table: Table | null) => void;
  addFile: (file: DatabaseFile) => void;
  removeFile: (fileId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setPagination: (pagination: PaginationState) => void;
  setSort: (sort: SortState) => void;
  setFilter: (filter: FilterState) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  activeFileId: null,
  activeTable: null,
  theme: 'light',
  sidebarOpen: true,
  pagination: { pageIndex: 0, pageSize: 50 },
  sort: { column: null, direction: null },
  filter: { column: null, value: '' },
  setActiveFile: (fileId) => set({ activeFileId: fileId, activeTable: null }),
  setActiveTable: (table) => set({ activeTable: table, pagination: { pageIndex: 0, pageSize: 50 } }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId),
    activeFileId: state.activeFileId === fileId ? null : state.activeFileId,
    activeTable: state.activeFileId === fileId ? null : state.activeTable,
  })),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPagination: (pagination) => set({ pagination }),
  setSort: (sort) => set({ sort }),
  setFilter: (filter) => set({ filter }),
}));
