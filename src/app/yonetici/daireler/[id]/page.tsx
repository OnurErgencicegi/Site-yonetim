import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, Rozet } from "@/components/yonetici/Ortak";
import { AY_ADLARI, MESLEK_ETIKETLERI } from "@/types/veritabani";
import { Phone, Mail, Car, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SakinEkleFormu from "@/components/yonetici/SakinEkleFormu";

export const dynamic = "force-dynamic";

export default async function DaireDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseSunucu();

  const { data: daire } = await supabase
    .from("daireler")
    .select("id, daire_no, daire_tipi, dolu_mu, kat_id!inner(kat_no, blok_id!inner(ad, site_id))")
    .eq("id", id)
    .single();

  if (!daire) {
    return <Panel className="p-8 text-center">Daire bulunamadı.</Panel>;
  }

  const { data: sakinler } = await supabase
    .from("daire_sakinleri")
    .select("*, araclar(*)")
    .eq("daire_id", id)
    .eq("onay_durumu", "onaylandi")
    .eq("aktif_mi", true);

  const malik = sakinler?.find((s) => s.sakin_tipi === "malik") ?? null;
  const kiraci = sakinler?.find((s) => s.sakin_tipi === "kiraci") ?? null;

  const yil = new Date().getFullYear();
  const { data: aidatlar } = await supabase
    .from("aidat_odemeleri")
    .select("*")
    .eq("daire_id", id)
    .gte("donem", `${yil}-01-01`)
    .lte("donem", `${yil}-12-31`)
    .order("donem");

  const aidatMap = new Map((aidatlar ?? []).map((a) => [new Date(a.donem).getMonth(), a]));

  const blok = daire.kat_id as unknown as { kat_no: number; blok_id: { ad: string } };

  return (
    <div>
      <Link
        href="/yonetici/daireler"
        className="inline-flex items-center gap-1.5 text-sm mb-4"
        style={{ color: "var(--metin-ikincil)" }}
      >
        <ArrowLeft size={14} /> Bloklar & Daireler
      </Link>

      <SayfaBasligi
        baslik={`${blok.blok_id.ad} · Daire ${daire.daire_no}`}
        aciklama={`${blok.kat_no}. Kat · ${daire.daire_tipi === "isyeri" ? "İşyeri" : "Konut"}`}
        aksiyon={<Rozet metin={daire.dolu_mu ? "Dolu" : "Boş"} tip={daire.dolu_mu ? "basari" : "notr"} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <KisiKarti baslik="Malik (Ev Sahibi)" sakin={malik} daireId={id} sakinTipi="malik" />
        <KisiKarti baslik="Kiracı" sakin={kiraci} daireId={id} sakinTipi="kiraci" />
      </div>

      <Panel className="overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--kagit-cizgi)", background: "#FAF9F6" }}
        >
          <h2 className="font-baslik text-lg">{yil} Aidat Takibi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--metin-ikincil)" }}>
                <th className="text-left px-5 py-2 font-medium">Ay</th>
                <th className="text-left px-5 py-2 font-medium">Tutar</th>
                <th className="text-left px-5 py-2 font-medium">Durum</th>
                <th className="text-left px-5 py-2 font-medium">Ödeme Şekli</th>
                <th className="text-left px-5 py-2 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
              {AY_ADLARI.map((ayAdi, i) => {
                const kayit = aidatMap.get(i);
                return (
                  <tr key={ayAdi}>
                    <td className="px-5 py-2.5">{ayAdi}</td>
                    <td className="px-5 py-2.5">
                      {kayit ? `${kayit.borc_tutari.toLocaleString("tr-TR")} ₺` : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      {kayit ? (
                        <Rozet
                          metin={
                            kayit.durum === "verdi"
                              ? "Verdi"
                              : kayit.durum === "kismi"
                              ? "Kısmi"
                              : "Vermedi"
                          }
                          tip={
                            kayit.durum === "verdi"
                              ? "basari"
                              : kayit.durum === "kismi"
                              ? "bekleme"
                              : "uyari"
                          }
                        />
                      ) : (
                        <span style={{ color: "var(--metin-ikincil)" }}>Tanımsız</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      {kayit?.odeme_yontemi === "nakit"
                        ? "Nakit"
                        : kayit?.odeme_yontemi === "eft"
                        ? "EFT"
                        : "—"}
                    </td>
                    <td className="px-5 py-2.5">{kayit?.odeme_tarihi ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function KisiKarti({
  baslik,
  sakin,
  daireId,
  sakinTipi,
}: {
  baslik: string;
  sakin: {
    id: string;
    ad_soyad: string;
    telefon: string;
    telefon2: string | null;
    eposta: string | null;
    meslek_tipi: keyof typeof MESLEK_ETIKETLERI | null;
    fotograf_url: string;
    araclar?: { id: string; plaka: string; marka_model: string | null }[];
  } | null;
  daireId: string;
  sakinTipi: "malik" | "kiraci";
}) {
  return (
    <Panel className="p-5">
      <p className="text-xs font-medium mb-3" style={{ color: "var(--metin-ikincil)" }}>
        {baslik}
      </p>

      {!sakin ? (
        <SakinEkleFormu daireId={daireId} sakinTipi={sakinTipi} baslik={baslik} />
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sakin.fotograf_url}
              alt={sakin.ad_soyad}
              className="w-12 h-12 rounded-full object-cover"
              style={{ background: "var(--kagit-cizgi)" }}
            />
            <div>
              <p className="font-medium">{sakin.ad_soyad}</p>
              {sakin.meslek_tipi && (
                <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                  {MESLEK_ETIKETLERI[sakin.meslek_tipi]}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <Phone size={13} style={{ color: "var(--metin-ikincil)" }} /> {sakin.telefon}
              {sakin.telefon2 && ` · ${sakin.telefon2}`}
            </p>
            {sakin.eposta && (
              <p className="flex items-center gap-2">
                <Mail size={13} style={{ color: "var(--metin-ikincil)" }} /> {sakin.eposta}
              </p>
            )}
            {sakin.araclar && sakin.araclar.length > 0 && (
              <div className="flex items-start gap-2">
                <Car size={13} className="mt-0.5" style={{ color: "var(--metin-ikincil)" }} />
                <div>
                  {sakin.araclar.map((a) => (
                    <p key={a.id}>
                      {a.plaka} {a.marka_model && `· ${a.marka_model}`}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
