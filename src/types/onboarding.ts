export interface OnboardingData {
  siteName: string;
  il: string;
  ilce: string;
  adres: string;
  bloks: {
    name: string;
    floors: number;
    apartments: number[];
  }[];
}

export interface SiteFormData {
  siteName: string;
  il: string;
  ilce: string;
  adres: string;
  blockCount: number;
}

export interface BlockFormData {
  blocks: { name: string }[];
}

export interface FloorFormData {
  floorData: {
    blockName: string;
    floorCount: number;
  }[];
}

export interface ApartmentFormData {
  apartmentData: {
    blockName: string;
    floorNumber: number;
    apartmentCount: number;
  }[];
}