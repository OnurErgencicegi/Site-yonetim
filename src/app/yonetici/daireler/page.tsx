import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, Rozet } from "@/components/yonetici/Ortak";
import Link from "next/link";
import { Home, Store } from "lucide-react";
import YeniBlokEkle from "@/components/yonetici/YeniBlokEkle";

export const dynamic = "force-dynamic";

export default async function DairelerSayfasi() {
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

  const { data: bloklar } = await supabase
    .from("bloklar")
    .select("id, ad, katlar(id, kat_no, daireler(id, daire_no, daire_tipi, dolu_mu))")
    .eq("site_id", site.id)
    .order("ad");

  return (
    <div>
      <SayfaBasligi
        baslik="Bloklar & Daireler"
        aciklama="Sitenizin blok, kat ve daire yapısı"
        aksiyon={<YeniBlokEkle siteId={site.id} />}
      />

      {(!bloklar || bloklar.length === 0) && (
        <Panel className="p-8 text-center">
          <p style={{ color: "var(--metin-ikincil)" }}>
            Henüz blok eklenmedi. Başlamak için &ldquo;Yeni Blok Ekle&rdquo; butonunu kullanın.
          </p>
        </Panel>
      )}

      <div className="space-y-5">
        {bloklar?.map((blok) => {
          const katlar = [...(blok.katlar ?? [])].sort((a, b) => b.kat_no - a.kat_no);
          return (
            <Panel key={blok.id} className="overflow-hidden">
              <div
                className="px-5 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--kagit-cizgi)", background: "#FAF9F6" }}
              >
                <h2 className="font-baslik text-lg">{blok.ad}</h2>
                <span className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                  {katlar.reduce((n, k) => n + (k.daireler?.length ?? 0), 0)} bağımsız bölüm
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
                {katlar.map((kat) => (
                  <div key={kat.id} className="px-5 py-3 flex items-center gap-4">
                    <span
                      className="text-xs font-medium w-16 shrink-0"
                      style={{ color: "var(--metin-ikincil)" }}
                    >
                      {kat.kat_no}. Kat
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[...(kat.daireler ?? [])]
                        .sort((a, b) => a.daire_no.localeCompare(b.daire_no))
                        .map((daire) => (
                          <Link
                            key={daire.id}
                            href={`/yonetici/daireler/${daire.id}`}
                            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-black/[.03] transition-colors"
                            style={{ borderColor: "var(--kagit-cizgi)" }}
                          >
                            {daire.daire_tipi === "isyeri" ? (
                              <Store size={13} style={{ color: "var(--metin-ikincil)" }} />
                            ) : (
                              <Home size={13} style={{ color: "var(--metin-ikincil)" }} />
                            )}
                            {daire.daire_no}
                            {daire.daire_tipi === "daire" && (
                              <Rozet
                                metin={daire.dolu_mu ? "Dolu" : "Boş"}
                                tip={daire.dolu_mu ? "basari" : "notr"}
                              />
                            )}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
