"use client";

import { useState } from "react";
import { Panel, BirincilButon, Rozet, paraFormatla } from "./Ortak";
import { aidatTanimla, ayIcinBorcOlustur, aidatDurumGuncelle } from "@/app/yonetici/eylemler";
import type { AidatDurumu, OdemeYontemi } from "@/types/veritabani";

interface OdemeSatiri {
  id: string;
  borc_tutari: number;
  odenen_tutar: number;
  durum: AidatDurumu;
  odeme_yontemi: OdemeYontemi | null;
  odeme_tarihi: string | null;
  daire_id: { daire_no: string; kat_id: { blok_id: { ad: string } } };
}

export default function AidatArayuzu({
  siteId,
  guncelTutar,
  buAyStr,
  odemeler,
}: {
  siteId: string;
  guncelTutar: number | null;
  buAyStr: string;
  odemeler: OdemeSatiri[];
}) {
  const [tutar, setTutar] = useState(guncelTutar?.toString() ?? "");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function yeniTutarKaydet() {
    const sayi = Number(tutar);
    if (!sayi || sayi <= 0) return;
    setYukleniyor(true);
    try {
      await aidatTanimla(siteId, sayi, new Date().toISOString().slice(0, 10));
    } finally {
      setYukleniyor(false);
    }
  }

  async function buAyicinOlustur() {
    const sayi = Number(tutar);
    if (!sayi || sayi <= 0) return;
    setYukleniyor(true);
    try {
      await ayIcinBorcOlustur(siteId, buAyStr, sayi);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <p className="text-sm font-medium mb-3">Aidat Tutarı</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={tutar}
            onChange={(e) => setTutar(e.target.value)}
            placeholder="Örn: 1500"
            className="rounded-md border px-3 py-2 text-sm w-40"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          />
          <span className="text-sm" style={{ color: "var(--metin-ikincil)" }}>
            ₺ / ay / daire
          </span>
          <BirincilButon onClick={yeniTutarKaydet} className={yukleniyor ? "opacity-60" : ""}>
            Tutarı Güncelle
          </BirincilButon>
          <BirincilButon onClick={buAyicinOlustur} className={yukleniyor ? "opacity-60" : ""}>
            Bu Ay İçin Borç Oluştur
          </BirincilButon>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--metin-ikincil)" }}>
          &ldquo;Bu Ay İçin Borç Oluştur&rdquo; tüm dairelere bu ayın aidat kaydını açar. Zaten
          kaydı olan daireler tekrar oluşturulmaz.
        </p>
      </Panel>

      <Panel className="overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--kagit-cizgi)", background: "#FAF9F6" }}
        >
          <h2 className="font-baslik text-lg">Bu Ayın Durumu</h2>
        </div>
        {odemeler.length === 0 ? (
          <p className="p-8 text-center text-sm" style={{ color: "var(--metin-ikincil)" }}>
            Bu ay için henüz borç kaydı oluşturulmadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: "var(--metin-ikincil)" }}>
                  <th className="text-left px-5 py-2 font-medium">Daire</th>
                  <th className="text-left px-5 py-2 font-medium">Tutar</th>
                  <th className="text-left px-5 py-2 font-medium">Durum</th>
                  <th className="text-left px-5 py-2 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
                {odemeler.map((o) => (
                  <OdemeSatiriRow key={o.id} odeme={o} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function OdemeSatiriRow({ odeme }: { odeme: OdemeSatiri }) {
  const [durum, setDurum] = useState(odeme.durum);
  const [yontem, setYontem] = useState<OdemeYontemi>(odeme.odeme_yontemi ?? "nakit");
  const [isleniyor, setIsleniyor] = useState(false);

  async function isaretle(yeniDurum: AidatDurumu) {
    setIsleniyor(true);
    try {
      await aidatDurumGuncelle(
        odeme.id,
        yeniDurum,
        yeniDurum === "vermedi" ? undefined : yontem,
        yeniDurum === "verdi" ? odeme.borc_tutari : yeniDurum === "kismi" ? odeme.odenen_tutar : 0
      );
      setDurum(yeniDurum);
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <tr>
      <td className="px-5 py-2.5">
        {odeme.daire_id.kat_id.blok_id.ad} · {odeme.daire_id.daire_no}
      </td>
      <td className="px-5 py-2.5">{paraFormatla(odeme.borc_tutari)}</td>
      <td className="px-5 py-2.5">
        <Rozet
          metin={durum === "verdi" ? "Verdi" : durum === "kismi" ? "Kısmi" : "Vermedi"}
          tip={durum === "verdi" ? "basari" : durum === "kismi" ? "bekleme" : "uyari"}
        />
      </td>
      <td className="px-5 py-2.5">
        <div className="flex items-center gap-2">
          <select
            value={yontem}
            onChange={(e) => setYontem(e.target.value as OdemeYontemi)}
            className="rounded-md border px-2 py-1 text-xs"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          >
            <option value="nakit">Nakit</option>
            <option value="eft">EFT</option>
          </select>
          <button
            disabled={isleniyor}
            onClick={() => isaretle("verdi")}
            className="text-xs rounded-md px-2.5 py-1 text-white disabled:opacity-50"
            style={{ background: "var(--camur-yesil)" }}
          >
            Verdi
          </button>
          <button
            disabled={isleniyor}
            onClick={() => isaretle("vermedi")}
            className="text-xs rounded-md px-2.5 py-1 border disabled:opacity-50"
            style={{ borderColor: "var(--kagit-cizgi)", color: "var(--uyari-kirmizi)" }}
          >
            Vermedi
          </button>
        </div>
      </td>
    </tr>
  );
}
