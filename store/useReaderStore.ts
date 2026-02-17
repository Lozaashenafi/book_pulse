import { create } from "zustand";

interface ReaderState {
  currentPage: number;
  isSidebarOpen: boolean;
  fontSize: number;
  setCurrentPage: (page: number) => void;
  toggleSidebar: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  currentPage: 1,
  isSidebarOpen: true,
  fontSize: 16,
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
