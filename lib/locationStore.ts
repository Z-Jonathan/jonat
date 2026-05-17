import { create } from 'zustand';

import type { DealCategory } from '../constants/categories';

export const DEFAULT_RADIUS_MILES = 5;

export type Coords = { lat: number; lng: number };

type LocationState = {
  coords: Coords | null;
  radiusMiles: number;
  // Empty array => no filter (all categories).
  categories: DealCategory[];
  setCoords: (coords: Coords) => void;
  clearCoords: () => void;
  setRadiusMiles: (miles: number) => void;
  toggleCategory: (category: DealCategory) => void;
  clearCategories: () => void;
};

export const useLocationStore = create<LocationState>()((set) => ({
  coords: null,
  radiusMiles: DEFAULT_RADIUS_MILES,
  categories: [],
  setCoords: (coords) => set({ coords }),
  clearCoords: () => set({ coords: null }),
  setRadiusMiles: (radiusMiles) => set({ radiusMiles }),
  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),
  clearCategories: () => set({ categories: [] }),
}));
