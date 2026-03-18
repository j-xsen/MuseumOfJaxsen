import { create } from 'zustand';

interface MuseumState {
  activeArtworkId: string | null;
  isDetailViewOpen: boolean;
  isBackWallView: boolean;
  isBackRoomReady: boolean;
  // True from the moment the user hits Details until the camera has fully
  // returned to the front wall. BackWallArtwork stays mounted during this window.
  isBackRoomVisible: boolean;
  scrollPosition: number;
  setActiveArtworkId: (id: string | null) => void;
  setDetailViewOpen: (open: boolean) => void;
  setScrollPosition: (position: number) => void;
  openArtworkDetail: (id: string) => void;
  closeArtworkDetail: () => void;
  setIsBackWallView: (v: boolean) => void;
  setIsBackRoomReady: (v: boolean) => void;
  setIsBackRoomVisible: (v: boolean) => void;
}

export const useMuseumStore = create<MuseumState>((set) => ({
  activeArtworkId: null,
  isDetailViewOpen: false,
  isBackWallView: false,
  isBackRoomReady: false,
  isBackRoomVisible: false,
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

  // When entering back-wall view, mark both ready-gate and visibility immediately.
  // When leaving, only clear the ready-gate; CameraAnimator clears visibility
  // once theta has fully returned so BackWallArtwork stays until the pan is done.
  setIsBackWallView: (v) => set(v
    ? { isBackWallView: true, isBackRoomVisible: true, isBackRoomReady: false }
    : { isBackWallView: false, isBackRoomReady: false }
  ),
  setIsBackRoomReady: (v) => set({ isBackRoomReady: v }),
  setIsBackRoomVisible: (v) => set({ isBackRoomVisible: v }),
}));
