import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, Rozet } from "@/components/yonetici/Ortak";
import OnayButonlari from "@/components/yonetici/OnayButonlari";

export const dynamic = "force-dynamic";

export default async function OnayKuyrugu() {
  const supabase = await supabaseSunucu();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: site } = await supabase
    .from("siteler")
    .select("id")
    .eq("yonetici_id", user!.id)
    .single();

  if (!site) return null;

  const { data: bekleyenler } = await supabase
    .from("daire_sakinleri")
    .select(
      "id, ad_soyad, telefon, sakin_tipi, fotograf_url, bekleyen_degisiklikler, daire_id!inner(daire_no, kat_id!inner(blok_id!inner(ad, site_id)))"
    )
    .eq("onay_durumu", "beklemede")
    .eq("daire_id.kat_id.blok_id.site_id", site.id);

  return (
    <div>
      <SayfaBasligi
        baslik="Onay Kuyruğu"
        aciklama="Yeni sakin kayıtları ve bilgi güncellemeleri onayınızı bekliyor"
      />

      {(!bekleyenler || bekleyenler.length === 0) && (
        <Panel className="p-8 text-center">
          <p style={{ color: "var(--metin-ikincil)" }}>Bekleyen onay bulunmuyor.</p>
        </Panel>
      )}

      <div className="space-y-3">
        {bekleyenler?.map((k) => {
          const daire = k.daire_id as unknown as {
            daire_no: string;
            kat_id: { blok_id: { ad: string } };
          };
          return (
            <Panel key={k.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={k.fotograf_url}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ background: "var(--kagit-cizgi)" }}
                />
                <div>
                  <p className="text-sm font-medium">
                    {k.ad_soyad}{" "}
                    <span style={{ color: "var(--metin-ikincil)" }}>· {k.telefon}</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                    {daire.kat_id.blok_id.ad} · Daire {daire.daire_no} ·{" "}
                    {k.sakin_tipi === "malik" ? "Malik" : "Kiracı"}
                    {k.bekleyen_degisiklikler && " · Bilgi güncellemesi"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Rozet metin="Beklemede" tip="bekleme" />
                <OnayButonlari sakinId={k.id} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
