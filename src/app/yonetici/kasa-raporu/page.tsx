import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, paraFormatla } from "@/components/yonetici/Ortak";
import { AY_ADLARI } from "@/types/veritabani";

export const dynamic = "force-dynamic";

export default async function KasaRaporuSayfasi() {
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

  const yil = new Date().getFullYear();
  const { data: aylar } = await supabase
    .from("aylik_kasa_durumu")
    .select("*")
    .eq("site_id", site.id)
    .gte("ay", `${yil}-01-01`)
    .lte("ay", `${yil}-12-31`)
    .order("ay");

  const ayMap = new Map((aylar ?? []).map((a) => [new Date(a.ay).getMonth(), a]));

  const yillikGelir = (aylar ?? []).reduce((n, a) => n + a.toplam_gelir, 0);
  const yillikGider = (aylar ?? []).reduce((n, a) => n + a.toplam_gider, 0);

  return (
    <div>
      <SayfaBasligi
        baslik="Kasa Raporu"
        aciklama={`${yil} yılı gelir-gider dökümü`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Panel className="p-5">
          <p className="text-xs mb-1" style={{ color: "var(--metin-ikincil)" }}>
            Yıllık Toplam Gelir
          </p>
          <p className="font-baslik text-2xl">{paraFormatla(yillikGelir)}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs mb-1" style={{ color: "var(--metin-ikincil)" }}>
            Yıllık Toplam Gider
          </p>
          <p className="font-baslik text-2xl">{paraFormatla(yillikGider)}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs mb-1" style={{ color: "var(--metin-ikincil)" }}>
            Yıl Sonu Bakiye
          </p>
          <p
            className="font-baslik text-2xl"
            style={{
              color: yillikGelir - yillikGider >= 0 ? "var(--camur-yesil)" : "var(--uyari-kirmizi)",
            }}
          >
            {paraFormatla(yillikGelir - yillikGider)}
          </p>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--kagit-cizgi)", background: "#FAF9F6" }}
        >
          <h2 className="font-baslik text-lg">Aylık Döküm</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--metin-ikincil)" }}>
              <th className="text-left px-5 py-2 font-medium">Ay</th>
              <th className="text-left px-5 py-2 font-medium">Gelir</th>
              <th className="text-left px-5 py-2 font-medium">Gider</th>
              <th className="text-left px-5 py-2 font-medium">Bakiye</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
            {AY_ADLARI.map((ayAdi, i) => {
              const veri = ayMap.get(i);
              return (
                <tr key={ayAdi}>
                  <td className="px-5 py-2.5">{ayAdi}</td>
                  <td className="px-5 py-2.5">{paraFormatla(veri?.toplam_gelir ?? 0)}</td>
                  <td className="px-5 py-2.5">{paraFormatla(veri?.toplam_gider ?? 0)}</td>
                  <td
                    className="px-5 py-2.5 font-medium"
                    style={{
                      color:
                        (veri?.bakiye ?? 0) >= 0 ? "var(--camur-yesil)" : "var(--uyari-kirmizi)",
                    }}
                  >
                    {paraFormatla(veri?.bakiye ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <p className="text-xs mt-4" style={{ color: "var(--metin-ikincil)" }}>
        Excel/PDF indirme özelliği bir sonraki aşamada eklenecek.
      </p>
    </div>
  );
}
