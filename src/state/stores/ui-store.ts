/**
 * UI Store
 * 
 * Global state for UI-related state (modals, toasts, etc.)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ModalState {
  createHabit: boolean;
  editHabit: string | null; // habit id
  achievements: boolean;
  ranks: boolean;
  settings: boolean;
  profile: boolean;
  confirmDelete: string | null; // entity id
}

interface UIStore {
  // State
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  modals: ModalState;
  toasts: Toast[];
  isCommandPaletteOpen: boolean;
  activeSection: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: keyof ModalState, id?: string) => void;
  closeModal: (modal: keyof ModalState) => void;
  closeAllModals: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
}

const initialModals: ModalState = {
  createHabit: false,
  editHabit: null,
  achievements: false,
  ranks: false,
  settings: false,
  profile: false,
  confirmDelete: null,
};

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set) => ({
      // Initial state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      modals: initialModals,
      toasts: [],
      isCommandPaletteOpen: false,
      activeSection: 'habits',

      // Actions
      toggleSidebar: () =>
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.isSidebarOpen = open;
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.isSidebarCollapsed = collapsed;
        }),

      openModal: (modal, id) =>
        set((state) => {
          if (modal === 'editHabit' || modal === 'confirmDelete') {
            state.modals[modal] = id ?? null;
          } else {
            state.modals[modal] = true;
          }
        }),

      closeModal: (modal) =>
        set((state) => {
          if (modal === 'editHabit' || modal === 'confirmDelete') {
            state.modals[modal] = null;
          } else {
            state.modals[modal] = false;
          }
        }),

      closeAllModals: () =>
        set((state) => {
          state.modals = initialModals;
        }),

      addToast: (toast) =>
        set((state) => {
          const id = Math.random().toString(36).substring(2, 9);
          state.toasts.push({ ...toast, id });
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }),

      clearToasts: () =>
        set((state) => {
          state.toasts = [];
        }),

      setCommandPaletteOpen: (open) =>
        set((state) => {
          state.isCommandPaletteOpen = open;
        }),

      setActiveSection: (section) =>
        set((state) => {
          state.activeSection = section;
        }),
    })),
    { name: 'UIStore' }
  )
);

// Helper hook for toasts
export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return {
    toast: (props: Omit<Toast, 'id'>) => {
      addToast(props);
    },
    success: (title: string, description?: string) => {
      addToast({ type: 'success', title, description });
    },
    error: (title: string, description?: string) => {
      addToast({ type: 'error', title, description });
    },
    warning: (title: string, description?: string) => {
      addToast({ type: 'warning', title, description });
    },
    info: (title: string, description?: string) => {
      addToast({ type: 'info', title, description });
    },
    dismiss: removeToast,
  };
}
