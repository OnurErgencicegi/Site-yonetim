import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi } from "@/components/yonetici/Ortak";
import { GOREV_ETIKETLERI } from "@/types/veritabani";
import KurulArayuzu from "@/components/yonetici/KurulArayuzu";

export const dynamic = "force-dynamic";

export default async function KurulSayfasi() {
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

  const { data: uyeler } = await supabase
    .from("kurul_uyeleri")
    .select("*")
    .eq("site_id", site.id);

  return (
    <div>
      <SayfaBasligi
        baslik="Yönetim & Denetim Kurulu"
        aciklama="Kurul üyelerinin bilgilerini yönetin"
      />
      <KurulArayuzu siteId={site.id} uyeler={uyeler ?? []} etiketler={GOREV_ETIKETLERI} />
    </div>
  );
}
