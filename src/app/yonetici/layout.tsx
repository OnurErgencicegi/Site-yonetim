import { redirect } from "next/navigation";
import { supabaseSunucu } from "@/lib/supabase/server";
import YanMenu from "@/components/yonetici/YanMenu";

export default async function YoneticiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseSunucu();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const { data: profil } = await supabase
    .from("profiller")
    .select("rol, ad_soyad")
    .eq("id", user!.id)
    .single();

  if (!profil || (profil.rol !== "site_yoneticisi" && profil.rol !== "super_yonetici")) {
    redirect("/giris?hata=yetkisiz");
  }

  const { data: site } = await supabase
    .from("siteler")
    .select("ad")
    .eq("yonetici_id", user!.id)
    .maybeSingle();

  // Site yöneticisinin henüz sitesi yoksa direkt kuruluma yönlendir
  if (!site && profil.rol === "site_yoneticisi") {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--kagit)" }}>
      <YanMenu siteAdi={site?.ad ?? "Site seçilmedi"} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}