import { supabaseSunucu } from "@/lib/supabase/server";
import { Panel, SayfaBasligi, paraFormatla } from "@/components/yonetici/Ortak";
import { AY_ADLARI } from "@/types/veritabani";
import { Wallet, TrendingDown, TrendingUp, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function siteIdGetir() {
  const supabase = await supabaseSunucu();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: site } = await supabase
    .from("siteler")
    .select("id, ad")
    .eq("yonetici_id", user!.id)
    .maybeSingle();
  return site;
}

export default async function YoneticiPaneli() {
  const supabase = await supabaseSunucu();
  const site = await siteIdGetir();

  if (!site) {
    return (
      <Panel className="p-8 text-center">
        <p style={{ color: "var(--metin-ikincil)" }}>
          Hesabınıza henüz bir site atanmamış. Süper yöneticinizle iletişime geçin.
        </p>
      </Panel>
    );
  }

  const buAy = new Date();
  buAy.setDate(1);
  const buAyStr = buAy.toISOString().slice(0, 10);

  const [{ count: toplamDaire }, { data: aidatlar }, { count: bekleyenOnay }, { data: kasa }] =
    await Promise.all([
      supabase
        .from("daireler")
        .select("id, kat_id!inner(blok_id!inner(site_id))", { count: "exact", head: true })
        .eq("kat_id.blok_id.site_id", site.id),
      supabase
        .from("aidat_odemeleri")
        .select("durum, daire_id!inner(kat_id!inner(blok_id!inner(site_id)))")
        .eq("donem", buAyStr)
        .eq("daire_id.kat_id.blok_id.site_id", site.id),
      supabase
        .from("daire_sakinleri")
        .select("id, daire_id!inner(kat_id!inner(blok_id!inner(site_id)))", {
          count: "exact",
          head: true,
        })
        .eq("onay_durumu", "beklemede")
        .eq("daire_id.kat_id.blok_id.site_id", site.id),
      supabase
        .from("aylik_kasa_durumu")
        .select("*")
        .eq("site_id", site.id)
        .order("ay", { ascending: false })
        .limit(1),
    ]);

  const odeyenSayisi = aidatlar?.filter((a) => a.durum === "verdi").length ?? 0;
  const toplamAidatKaydi = aidatlar?.length ?? 0;
  const odemeYuzdesi =
    toplamAidatKaydi > 0 ? Math.round((odeyenSayisi / toplamAidatKaydi) * 100) : 0;

  const buAyKasa = kasa?.[0];
  const ayAdi = AY_ADLARI[new Date().getMonth()];

  return (
    <div>
      <SayfaBasligi
        baslik="Panel"
        aciklama={`${ayAdi} ${new Date().getFullYear()} durumu`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Panel className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
              Toplam Daire
            </span>
          </div>
          <p className="font-baslik text-3xl">{toplamDaire ?? 0}</p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
              Bu Ay Aidat Ödeme Oranı
            </span>
          </div>
          <p className="font-baslik text-3xl" style={{ color: "var(--camur-yesil)" }}>
            %{odemeYuzdesi}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--metin-ikincil)" }}>
            {odeyenSayisi}/{toplamAidatKaydi} daire ödedi
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: "var(--basari-yesil)" }} />
            <span className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
              Bu Ay Gelir
            </span>
          </div>
          <p className="font-baslik text-3xl">
            {paraFormatla(buAyKasa?.toplam_gelir ?? 0)}
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} style={{ color: "var(--uyari-kirmizi)" }} />
            <span className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
              Kasa Bakiyesi
            </span>
          </div>
          <p
            className="font-baslik text-3xl"
            style={{
              color: (buAyKasa?.bakiye ?? 0) >= 0 ? "var(--camur-yesil)" : "var(--uyari-kirmizi)",
            }}
          >
            {paraFormatla(buAyKasa?.bakiye ?? 0)}
          </p>
        </Panel>
      </div>

      {(bekleyenOnay ?? 0) > 0 && (
        <Link href="/yonetici/onay-kuyrugu">
          <Panel className="p-5 mb-6 flex items-center justify-between hover:bg-black/[.02] transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-2"
                style={{ background: "var(--bekleme-amber-zemin)" }}
              >
                <UserCheck size={18} style={{ color: "var(--bekleme-amber)" }} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {bekleyenOnay} kayıt onayınızı bekliyor
                </p>
                <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                  Yeni sakin kayıtları veya bilgi güncellemeleri
                </p>
              </div>
            </div>
            <ArrowRight size={18} style={{ color: "var(--metin-ikincil)" }} />
          </Panel>
        </Link>
      )}

      <Panel className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={16} style={{ color: "var(--camur-yesil)" }} />
          <p className="text-sm font-medium">Hızlı Bağlantılar</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {[
            { href: "/yonetici/aidat", etiket: "Aidat İşaretle" },
            { href: "/yonetici/gelir-gider", etiket: "Gider Ekle" },
            { href: "/yonetici/daireler", etiket: "Daire Ekle" },
            { href: "/yonetici/kasa-raporu", etiket: "Rapor İndir" },
            { href: "/yonetici/kurul", etiket: "Kurul Bilgisi" },
            { href: "/yonetici/onay-kuyrugu", etiket: "Onay Kuyruğu" },
          ].map((baglanti) => (
            <Link
              key={baglanti.href}
              href={baglanti.href}
              className="text-sm rounded-md border px-3 py-2.5 text-center hover:bg-black/[.02] transition-colors"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            >
              {baglanti.etiket}
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
