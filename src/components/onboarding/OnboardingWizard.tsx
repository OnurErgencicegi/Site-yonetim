"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseTarayici } from "@/lib/supabase/client";
import SiteForm from "./steps/SiteForm";
import BlockForm from "./steps/BlockForm";
import FloorForm from "./steps/FloorForm";
import ApartmentForm from "./steps/ApartmentForm";
import {
  OnboardingData,
  SiteFormCikti,
  BlockFormCikti,
  FloorFormCikti,
  katListesiOlustur,
} from "@/types/onboarding";

type Adim = "site" | "bloklar" | "katlar" | "daireler";

export default function OnboardingWizard() {
  const router = useRouter();
  const [adim, setAdim] = useState<Adim>("site");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string>();
  const [veri, setVeri] = useState<Partial<OnboardingData>>({ bloklar: [] });

  function siteGonderildi(cikti: SiteFormCikti) {
    setVeri({
      siteAdi: cikti.siteAdi,
      il: cikti.il,
      ilce: cikti.ilce,
      adres: cikti.adres,
      bloklar: Array.from({ length: cikti.blokSayisi }, () => ({
        ad: "",
        bodrumSayisi: 0,
        zeminVarMi: true,
        ustKatSayisi: 1,
        katlar: [],
      })),
    });
    setAdim("bloklar");
  }

  function bloklarGonderildi(cikti: BlockFormCikti) {
    const guncel = veri.bloklar?.map((blok, i) => ({
      ...blok,
      ad: cikti.bloklar[i]?.ad || blok.ad,
    }));
    setVeri({ ...veri, bloklar: guncel });
    setAdim("katlar");
  }

  function katlarGonderildi(cikti: FloorFormCikti) {
    const guncel = veri.bloklar?.map((blok, i) => {
      const ayar = cikti.bloklar[i];
      return {
        ...blok,
        bodrumSayisi: ayar.bodrumSayisi,
        zeminVarMi: ayar.zeminVarMi,
        ustKatSayisi: ayar.ustKatSayisi,
        katlar: katListesiOlustur(ayar.bodrumSayisi, ayar.zeminVarMi, ayar.ustKatSayisi),
      };
    });
    setVeri({ ...veri, bloklar: guncel });
    setAdim("daireler");
  }

  async function tamamla(bloklar: OnboardingData["bloklar"]) {
    setYukleniyor(true);
    setHata(undefined);
    try {
      const supabase = supabaseTarayici();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı, lütfen tekrar giriş yapın");

      const payload = bloklar.map((blok) => ({
        ad: blok.ad,
        katlar: blok.katlar.map((kat) => ({
          kat_no: kat.kat_no,
          daire_sayisi: kat.daire_sayisi,
          isyeri_sayisi: kat.isyeri_sayisi,
        })),
      }));

      const { error } = await supabase.rpc("site_kur", {
        p_site_adi: veri.siteAdi,
        p_il: veri.il,
        p_ilce: veri.ilce,
        p_adres: veri.adres,
        p_bloklar: payload,
      });

      if (error) throw new Error(error.message);

      router.push("/yonetici");
      router.refresh();
    } catch (e) {
      setHata((e as Error).message);
      setYukleniyor(false);
    }
  }

  const ilerlemeYuzdesi = { site: 25, bloklar: 50, katlar: 75, daireler: 100 }[adim];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {(["site", "bloklar", "katlar", "daireler"] as Adim[]).map((a) => (
              <span
                key={a}
                className={`text-sm font-semibold ${adim === a ? "text-green-400" : "text-gray-400"}`}
              >
                {{ site: "Site Bilgileri", bloklar: "Bloklar", katlar: "Katlar", daireler: "Daireler" }[a]}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${ilerlemeYuzdesi}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          {adim === "site" && <SiteForm onSubmit={siteGonderildi} />}

          {adim === "bloklar" && veri.bloklar && (
            <BlockForm
              blokSayisi={veri.bloklar.length}
              onSubmit={bloklarGonderildi}
              onBack={() => setAdim("site")}
            />
          )}

          {adim === "katlar" && veri.bloklar && (
            <FloorForm
              bloklar={veri.bloklar.map((b) => ({ ad: b.ad }))}
              onSubmit={katlarGonderildi}
              onBack={() => setAdim("bloklar")}
            />
          )}

          {adim === "daireler" && veri.bloklar && (
            <ApartmentForm
              bloklar={veri.bloklar}
              onSubmit={tamamla}
              onBack={() => setAdim("katlar")}
              loading={yukleniyor}
              hata={hata}
            />
          )}
        </div>
      </div>
    </div>
  );
}