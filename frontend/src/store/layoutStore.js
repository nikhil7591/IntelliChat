import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useLayoutStore = create(
  persist(
    (set) => ({
      activeTab: 'chats',
      selectedContact: null,
      setSelectedContact: (contact) => set({ selectedContact: contact }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      resetSelectedContact: () => set({ selectedContact: null })
    }),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export default useLayoutStore;
