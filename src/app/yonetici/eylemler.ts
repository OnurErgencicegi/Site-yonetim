"use server";

import { supabaseSunucu } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Blok / Kat / Daire ---

export async function blokEkle(siteId: string, ad: string): Promise<string> {
  const supabase = await supabaseSunucu();
  const { data, error } = await supabase
    .from("bloklar")
    .insert({ site_id: siteId, ad })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/daireler");
  return data.id as string;
}

export async function katVeDairelerEkle(
  blokId: string,
  katNo: number,
  daireler: { daire_no: string; daire_tipi: "daire" | "isyeri" }[]
) {
  const supabase = await supabaseSunucu();
  const { data: kat, error: katHata } = await supabase
    .from("katlar")
    .insert({ blok_id: blokId, kat_no: katNo })
    .select("id")
    .single();
  if (katHata) throw new Error(katHata.message);

  const { error: daireHata } = await supabase.from("daireler").insert(
    daireler.map((d) => ({ kat_id: kat.id, daire_no: d.daire_no, daire_tipi: d.daire_tipi }))
  );
  if (daireHata) throw new Error(daireHata.message);

  revalidatePath("/yonetici/daireler");
}

// --- Sakin Onay Kuyruğu ---

export async function sakinOnayla(sakinId: string) {
  const supabase = await supabaseSunucu();
  const { data: sakin, error: getHata } = await supabase
    .from("daire_sakinleri")
    .select("bekleyen_degisiklikler")
    .eq("id", sakinId)
    .single();
  if (getHata) throw new Error(getHata.message);

  const guncel: Record<string, unknown> = {
    onay_durumu: "onaylandi",
    bekleyen_degisiklikler: null,
  };

  // Bekleyen değişiklikler varsa ana alanlara işle
  if (sakin?.bekleyen_degisiklikler) {
    Object.assign(guncel, sakin.bekleyen_degisiklikler);
    guncel.onay_durumu = "onaylandi";
    guncel.bekleyen_degisiklikler = null;
  }

  const { error } = await supabase.from("daire_sakinleri").update(guncel).eq("id", sakinId);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/onay-kuyrugu");
  revalidatePath("/yonetici/daireler");
}

export async function sakinReddet(sakinId: string) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase
    .from("daire_sakinleri")
    .update({ onay_durumu: "reddedildi", bekleyen_degisiklikler: null })
    .eq("id", sakinId);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/onay-kuyrugu");
}

// --- Sakin (malik/kiracı) ekleme - yönetici tarafından ---

export async function sakinEkle(form: {
  daire_id: string;
  sakin_tipi: "malik" | "kiraci";
  ad_soyad: string;
  telefon: string;
  telefon2?: string;
  eposta?: string;
  meslek_tipi?: "kamu" | "ozel" | "emekli" | "issiz";
  fotograf_url: string;
}) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("daire_sakinleri").insert({
    ...form,
    onay_durumu: "onaylandi",
  });
  if (error) throw new Error(error.message);

  await supabase.from("daireler").update({ dolu_mu: true }).eq("id", form.daire_id);

  revalidatePath(`/yonetici/daireler/${form.daire_id}`);
  revalidatePath("/yonetici/daireler");
}

export async function aracEkle(sakinId: string, plaka: string, markaModel: string) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase
    .from("araclar")
    .insert({ sakin_id: sakinId, plaka, marka_model: markaModel || null });
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/daireler");
}

// --- Aidat ---

export async function aidatTanimla(siteId: string, tutar: number, gecerlilikTarihi: string) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase
    .from("aidat_tanimlari")
    .insert({ site_id: siteId, tutar, gecerlilik_tarihi: gecerlilikTarihi });
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/aidat");
}

export async function ayIcinBorcOlustur(siteId: string, donem: string, tutar: number) {
  const supabase = await supabaseSunucu();

  const { data: daireler, error: daireHata } = await supabase
    .from("daireler")
    .select("id, daire_tipi, kat_id!inner(blok_id!inner(site_id))")
    .eq("daire_tipi", "daire")
    .eq("kat_id.blok_id.site_id", siteId);
  if (daireHata) throw new Error(daireHata.message);

  const kayitlar = (daireler ?? []).map((d) => ({
    daire_id: d.id,
    donem,
    borc_tutari: tutar,
    durum: "vermedi" as const,
  }));

  const { error } = await supabase
    .from("aidat_odemeleri")
    .upsert(kayitlar, { onConflict: "daire_id,donem", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  revalidatePath("/yonetici/aidat");
}

export async function aidatDurumGuncelle(
  odemeId: string,
  durum: "verdi" | "vermedi" | "kismi",
  odemeYontemi?: "nakit" | "eft",
  odenenTutar?: number
) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase
    .from("aidat_odemeleri")
    .update({
      durum,
      odeme_yontemi: odemeYontemi ?? null,
      odenen_tutar: odenenTutar ?? 0,
      odeme_tarihi: durum === "vermedi" ? null : new Date().toISOString().slice(0, 10),
    })
    .eq("id", odemeId);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/aidat");
}

// --- Gelir / Gider ---

export async function ekGelirEkle(form: {
  site_id: string;
  gelir_tipi: "kira_geliri" | "diger";
  aciklama: string;
  tutar: number;
  gelir_tarihi: string;
}) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("ek_gelirler").insert(form);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/gelir-gider");
  revalidatePath("/yonetici/kasa-raporu");
}

export async function giderKategorisiEkle(siteId: string, ad: string) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("gider_kategorileri").insert({ site_id: siteId, ad });
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/gelir-gider");
}

export async function giderEkle(form: {
  site_id: string;
  kategori_id: string;
  tutar: number;
  gider_tarihi: string;
  aciklama: string;
}) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("giderler").insert(form);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/gelir-gider");
  revalidatePath("/yonetici/kasa-raporu");
}

// --- Kurul ---

export async function kurulUyesiEkle(form: {
  site_id: string;
  ad_soyad: string;
  telefon?: string;
  eposta?: string;
  fotograf_url?: string;
  gorev:
    | "yonetim_kurulu_baskani"
    | "yonetim_kurulu_baskan_yardimcisi"
    | "yonetim_kurulu_uyesi"
    | "denetim_kurulu_baskani"
    | "denetim_kurulu_uyesi";
}) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("kurul_uyeleri").insert(form);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/kurul");
}

export async function kurulUyesiSil(id: string) {
  const supabase = await supabaseSunucu();
  const { error } = await supabase.from("kurul_uyeleri").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/yonetici/kurul");
}
