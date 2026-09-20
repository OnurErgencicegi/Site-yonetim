import { supabaseSunucu } from "@/lib/supabase/server";
import { SayfaBasligi } from "@/components/yonetici/Ortak";
import GelirGiderArayuzu from "@/components/yonetici/GelirGiderArayuzu";

export const dynamic = "force-dynamic";

export default async function GelirGiderSayfasi() {
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

  const [{ data: kategoriler }, { data: sonGelirler }, { data: sonGiderler }] = await Promise.all([
    supabase.from("gider_kategorileri").select("*").eq("site_id", site.id).order("ad"),
    supabase
      .from("ek_gelirler")
      .select("*")
      .eq("site_id", site.id)
      .order("gelir_tarihi", { ascending: false })
      .limit(20),
    supabase
      .from("giderler")
      .select("*, gider_kategorileri(ad)")
      .eq("site_id", site.id)
      .order("gider_tarihi", { ascending: false })
      .limit(20),
  ]);

  return (
    <div>
      <SayfaBasligi
        baslik="Gelir & Gider"
        aciklama="Kira geliri, ek gelirler ve faturaları buradan girin"
      />
      <GelirGiderArayuzu
        siteId={site.id}
        kategoriler={kategoriler ?? []}
        sonGelirler={sonGelirler ?? []}
        sonGiderler={
          (sonGiderler ?? []) as unknown as {
            id: string;
            tutar: number;
            gider_tarihi: string;
            aciklama: string | null;
            gider_kategorileri: { ad: string } | null;
          }[]
        }
      />
    </div>
  );
}
