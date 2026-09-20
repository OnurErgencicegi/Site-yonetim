export type KullaniciRolu =
  | "super_yonetici"
  | "site_yoneticisi"
  | "yonetim_kurulu_uyesi"
  | "denetim_kurulu_uyesi"
  | "sakin";

export interface Profil {
  id: string;
  ad_soyad: string | null;
  telefon: string | null;
  rol: KullaniciRolu;
  olusturma_tarihi: string;
}

export interface Site {
  id: string;
  ad: string;
  il: string | null;
  ilce: string | null;
  adres: string | null;
  yonetici_id: string | null;
  olusturma_tarihi: string;
}

export interface Blok {
  id: string;
  site_id: string;
  ad: string;
}

export interface Kat {
  id: string;
  blok_id: string;
  kat_no: number;
}

export type DaireTipi = "daire" | "isyeri";

export interface Daire {
  id: string;
  kat_id: string;
  daire_no: string;
  daire_tipi: DaireTipi;
  dolu_mu: boolean;
  olusturma_tarihi: string;
}

export type SakinTipi = "malik" | "kiraci";
export type MeslekTipi = "kamu" | "ozel" | "emekli" | "issiz";
export type OnayDurumu = "onaylandi" | "beklemede" | "reddedildi";

export interface DaireSakini {
  id: string;
  daire_id: string;
  kullanici_id: string | null;
  sakin_tipi: SakinTipi;
  ad_soyad: string;
  telefon: string;
  telefon2: string | null;
  eposta: string | null;
  meslek_tipi: MeslekTipi | null;
  fotograf_url: string;
  aktif_mi: boolean;
  onay_durumu: OnayDurumu;
  bekleyen_degisiklikler: Record<string, unknown> | null;
  olusturan_id: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface Arac {
  id: string;
  sakin_id: string;
  plaka: string;
  marka_model: string | null;
}

export type KurulGorevi =
  | "yonetim_kurulu_baskani"
  | "yonetim_kurulu_baskan_yardimcisi"
  | "yonetim_kurulu_uyesi"
  | "denetim_kurulu_baskani"
  | "denetim_kurulu_uyesi";

export interface KurulUyesi {
  id: string;
  site_id: string;
  ad_soyad: string;
  telefon: string | null;
  eposta: string | null;
  fotograf_url: string | null;
  gorev: KurulGorevi;
  olusturma_tarihi: string;
}

export interface AidatTanimi {
  id: string;
  site_id: string;
  tutar: number;
  gecerlilik_tarihi: string;
  olusturma_tarihi: string;
}

export type AidatDurumu = "verdi" | "vermedi" | "kismi";
export type OdemeYontemi = "nakit" | "eft";

export interface AidatOdemesi {
  id: string;
  daire_id: string;
  donem: string;
  borc_tutari: number;
  odenen_tutar: number;
  durum: AidatDurumu;
  odeme_yontemi: OdemeYontemi | null;
  odeme_tarihi: string | null;
  not_aciklama: string | null;
}

export type GelirTipi = "kira_geliri" | "diger";

export interface EkGelir {
  id: string;
  site_id: string;
  gelir_tipi: GelirTipi;
  aciklama: string | null;
  tutar: number;
  gelir_tarihi: string;
}

export interface GiderKategorisi {
  id: string;
  site_id: string;
  ad: string;
}

export interface Gider {
  id: string;
  site_id: string;
  kategori_id: string | null;
  tutar: number;
  gider_tarihi: string;
  aciklama: string | null;
  fatura_url: string | null;
}

export interface AylikKasaDurumu {
  site_id: string;
  ay: string;
  toplam_gelir: number;
  toplam_gider: number;
  bakiye: number;
}

// Ekranlarda kullanılan, birden fazla tabloyu birleştiren yardımcı tipler
export interface DaireOzet extends Daire {
  blok_adi: string;
  kat_no: number;
  malik: DaireSakini | null;
  kiraci: DaireSakini | null;
  bu_ay_aidat_durumu: AidatDurumu | null;
}

export const GOREV_ETIKETLERI: Record<KurulGorevi, string> = {
  yonetim_kurulu_baskani: "Yönetim Kurulu Başkanı",
  yonetim_kurulu_baskan_yardimcisi: "Yönetim Kurulu Başkan Yardımcısı",
  yonetim_kurulu_uyesi: "Yönetim Kurulu Üyesi",
  denetim_kurulu_baskani: "Denetim Kurulu Başkanı",
  denetim_kurulu_uyesi: "Denetim Kurulu Üyesi",
};

export const MESLEK_ETIKETLERI: Record<MeslekTipi, string> = {
  kamu: "Kamu",
  ozel: "Özel Sektör",
  emekli: "Emekli",
  issiz: "İşsiz",
};

export const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
