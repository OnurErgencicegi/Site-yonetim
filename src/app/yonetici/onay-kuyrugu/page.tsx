import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, Rozet } from "@/components/yonetici/Ortak";
import OnayButonlari from "@/components/yonetici/OnayButonlari";

export const dynamic = "force-dynamic";

type TalepSatiri = {
  id: string;
  yeni_veri: Record<string, unknown>;
  olusturma_tarihi: string;
  sakin_id: {
    id: string;
    ad_soyad: string;
    telefon: string;
    sakin_tipi: "malik" | "kiraci";
    fotograf_url: string;
    daire_id: {
      daire_no: string;
      kat_id: { blok_id: { ad: string } };
    };
  };
};

const ALAN_ETIKETLERI: Record<string, string> = {
  ad_soyad: "Ad Soyad",
  telefon: "Telefon",
  telefon2: "Telefon 2",
  eposta: "E-posta",
  meslek_tipi: "Meslek",
};

export default async function OnayKuyrugu() {
  const supabase = await supabaseSunucu();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: site } = await supabase
    .from("siteler")
    .select("id")
    .eq("yonetici_id", user!.id)
    .maybeSingle();

  if (!site) return null;

  const { data: bekleyenler } = await supabase
    .from("sakin_degisiklik_talepleri")
    .select(
      "id, yeni_veri, olusturma_tarihi, sakin_id!inner(id, ad_soyad, telefon, sakin_tipi, fotograf_url, daire_id!inner(daire_no, kat_id!inner(blok_id!inner(ad, site_id))))"
    )
    .eq("durum", "beklemede")
    .eq("sakin_id.daire_id.kat_id.blok_id.site_id", site.id);

  const talepler = (bekleyenler ?? []) as unknown as TalepSatiri[];

  return (
    <div>
      <SayfaBasligi
        baslik="Onay Kuyruğu"
        aciklama="Sakinlerin bilgi güncelleme talepleri onayınızı bekliyor"
      />

      {talepler.length === 0 && (
        <Panel className="p-8 text-center">
          <p style={{ color: "var(--metin-ikincil)" }}>Bekleyen onay bulunmuyor.</p>
        </Panel>
      )}

      <div className="space-y-3">
        {talepler.map((t) => {
          const sakin = t.sakin_id;
          const daire = sakin.daire_id;
          const degisenAlanlar = Object.keys(t.yeni_veri || {});

          return (
            <Panel key={t.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sakin.fotograf_url}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ background: "var(--kagit-cizgi)" }}
                />
                <div>
                  <p className="text-sm font-medium">
                    {sakin.ad_soyad}{" "}
                    <span style={{ color: "var(--metin-ikincil)" }}>· {sakin.telefon}</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                    {daire.kat_id.blok_id.ad} · Daire {daire.daire_no} ·{" "}
                    {sakin.sakin_tipi === "malik" ? "Malik" : "Kiracı"}
                  </p>
                  {degisenAlanlar.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--metin-ikincil)" }}>
                      Güncellenen: {degisenAlanlar.map((a) => ALAN_ETIKETLERI[a] ?? a).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Rozet metin="Beklemede" tip="bekleme" />
                <OnayButonlari talepId={t.id} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}