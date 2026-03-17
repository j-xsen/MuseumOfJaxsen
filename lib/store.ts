import { create } from 'zustand';

interface MuseumState {
  activeArtworkId: string | null;
  isDetailViewOpen: boolean;
  isBackWallView: boolean;
  scrollPosition: number;
  setActiveArtworkId: (id: string | null) => void;
  setDetailViewOpen: (open: boolean) => void;
  setScrollPosition: (position: number) => void;
  openArtworkDetail: (id: string) => void;
  closeArtworkDetail: () => void;
  setIsBackWallView: (v: boolean) => void;
}

export const useMuseumStore = create<MuseumState>((set) => ({
  activeArtworkId: null,
  isDetailViewOpen: false,
  isBackWallView: false,
  scrollPosition: 0,

  setActiveArtworkId: (id) => set({ activeArtworkId: id }),

  setDetailViewOpen: (open) => set({ isDetailViewOpen: open }),

  setScrollPosition: (position) => set({ scrollPosition: position }),

  openArtworkDetail: (id) => set({
    activeArtworkId: id,
    isDetailViewOpen: true
  }),

  closeArtworkDetail: () => set({
    isDetailViewOpen: false
  }),

  setIsBackWallView: (v) => set({ isBackWallView: v }),
}));
