import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, Rozet } from "@/components/yonetici/Ortak";
import AidatArayuzu from "@/components/yonetici/AidatArayuzu";

export const dynamic = "force-dynamic";

export default async function AidatSayfasi() {
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

  const { data: guncelTanim } = await supabase
    .from("aidat_tanimlari")
    .select("*")
    .eq("site_id", site.id)
    .order("gecerlilik_tarihi", { ascending: false })
    .limit(1)
    .single();

  const buAyStr = new Date().toISOString().slice(0, 8) + "01";

  const { data: buAyOdemeleri } = await supabase
    .from("aidat_odemeleri")
    .select(
      "id, borc_tutari, odenen_tutar, durum, odeme_yontemi, odeme_tarihi, daire_id!inner(daire_no, kat_id!inner(blok_id!inner(ad, site_id)))"
    )
    .eq("donem", buAyStr)
    .eq("daire_id.kat_id.blok_id.site_id", site.id);

  return (
    <div>
      <SayfaBasligi
        baslik="Aidat Yönetimi"
        aciklama="Aidat tutarını belirleyin, bu ayın borcunu oluşturun ve ödemeleri işaretleyin"
      />
      <AidatArayuzu
        siteId={site.id}
        guncelTutar={guncelTanim?.tutar ?? null}
        buAyStr={buAyStr}
        odemeler={
          (buAyOdemeleri ?? []) as unknown as Parameters<typeof AidatArayuzu>[0]["odemeler"]
        }
      />
    </div>
  );
}
