export type KatTipi = "bodrum" | "zemin" | "normal";

export interface KatBilgisi {
  kat_no: number; // bodrum: -1, -2... | zemin: 0 | normal: 1, 2, 3...
  tip: KatTipi;
  daire_sayisi: number;
  isyeri_sayisi: number;
}

export interface BlokBilgisi {
  ad: string;
  bodrumSayisi: number;
  zeminVarMi: boolean;
  ustKatSayisi: number;
  katlar: KatBilgisi[];
}

export interface OnboardingData {
  siteAdi: string;
  il: string;
  ilce: string;
  adres: string;
  bloklar: BlokBilgisi[];
}

export interface SiteFormCikti {
  siteAdi: string;
  il: string;
  ilce: string;
  adres: string;
  blokSayisi: number;
}

export interface BlockFormCikti {
  bloklar: { ad: string }[];
}

export interface FloorFormCikti {
  bloklar: {
    bodrumSayisi: number;
    zeminVarMi: boolean;
    ustKatSayisi: number;
  }[];
}

export interface ApartmentFormCikti {
  bloklar: BlokBilgisi[];
}

/** Bodrum/zemin/normal seçimlerinden kat_no listesini üretir */
export function katListesiOlustur(
  bodrumSayisi: number,
  zeminVarMi: boolean,
  ustKatSayisi: number
): KatBilgisi[] {
  const katlar: KatBilgisi[] = [];

  for (let b = bodrumSayisi; b >= 1; b--) {
    katlar.push({ kat_no: -b, tip: "bodrum", daire_sayisi: 0, isyeri_sayisi: 1 });
  }
  if (zeminVarMi) {
    katlar.push({ kat_no: 0, tip: "zemin", daire_sayisi: 0, isyeri_sayisi: 2 });
  }
  for (let k = 1; k <= ustKatSayisi; k++) {
    katlar.push({ kat_no: k, tip: "normal", daire_sayisi: 2, isyeri_sayisi: 0 });
  }
  return katlar;
}

export function katEtiketi(kat: KatBilgisi): string {
  if (kat.tip === "bodrum") return `Bodrum ${Math.abs(kat.kat_no)}`;
  if (kat.tip === "zemin") return "Zemin Kat";
  return `${kat.kat_no}. Kat`;
}