"use client";

import { useState } from "react";
import { Panel, BirincilButon, paraFormatla } from "./Ortak";
import { ekGelirEkle, giderKategorisiEkle, giderEkle } from "@/app/yonetici/eylemler";
import { Plus } from "lucide-react";

interface Kategori {
  id: string;
  ad: string;
}
interface Gelir {
  id: string;
  gelir_tipi: "kira_geliri" | "diger";
  aciklama: string | null;
  tutar: number;
  gelir_tarihi: string;
}
interface GiderSatiri {
  id: string;
  tutar: number;
  gider_tarihi: string;
  aciklama: string | null;
  gider_kategorileri: { ad: string } | null;
}

export default function GelirGiderArayuzu({
  siteId,
  kategoriler,
  sonGelirler,
  sonGiderler,
}: {
  siteId: string;
  kategoriler: Kategori[];
  sonGelirler: Gelir[];
  sonGiderler: GiderSatiri[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <GelirFormu siteId={siteId} />
        <Panel className="overflow-hidden">
          <BaslikCubugu metin="Son Gelirler" />
          <div className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
            {sonGelirler.length === 0 && (
              <p className="p-4 text-sm" style={{ color: "var(--metin-ikincil)" }}>
                Henüz gelir kaydı yok.
              </p>
            )}
            {sonGelirler.map((g) => (
              <div key={g.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p>{g.aciklama || (g.gelir_tipi === "kira_geliri" ? "Kira Geliri" : "Diğer")}</p>
                  <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                    {g.gelir_tarihi}
                  </p>
                </div>
                <p className="font-medium" style={{ color: "var(--camur-yesil)" }}>
                  +{paraFormatla(g.tutar)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <GiderFormu siteId={siteId} kategoriler={kategoriler} />
        <Panel className="overflow-hidden">
          <BaslikCubugu metin="Son Giderler" />
          <div className="divide-y" style={{ borderColor: "var(--kagit-cizgi)" }}>
            {sonGiderler.length === 0 && (
              <p className="p-4 text-sm" style={{ color: "var(--metin-ikincil)" }}>
                Henüz gider kaydı yok.
              </p>
            )}
            {sonGiderler.map((g) => (
              <div key={g.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p>{g.gider_kategorileri?.ad ?? "Diğer"}</p>
                  <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                    {g.aciklama ? `${g.aciklama} · ` : ""}
                    {g.gider_tarihi}
                  </p>
                </div>
                <p className="font-medium" style={{ color: "var(--uyari-kirmizi)" }}>
                  −{paraFormatla(g.tutar)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function BaslikCubugu({ metin }: { metin: string }) {
  return (
    <div
      className="px-4 py-2.5 border-b"
      style={{ borderColor: "var(--kagit-cizgi)", background: "#FAF9F6" }}
    >
      <p className="text-sm font-medium">{metin}</p>
    </div>
  );
}

function GelirFormu({ siteId }: { siteId: string }) {
  const [tip, setTip] = useState<"kira_geliri" | "diger">("kira_geliri");
  const [aciklama, setAciklama] = useState("");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState(new Date().toISOString().slice(0, 10));
  const [yukleniyor, setYukleniyor] = useState(false);

  async function ekle() {
    const sayi = Number(tutar);
    if (!sayi || sayi <= 0) return;
    setYukleniyor(true);
    try {
      await ekGelirEkle({ site_id: siteId, gelir_tipi: tip, aciklama, tutar: sayi, gelir_tarihi: tarih });
      setAciklama("");
      setTutar("");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <Panel className="p-4">
      <p className="text-sm font-medium mb-3">Gelir Ekle</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={tip}
          onChange={(e) => setTip(e.target.value as "kira_geliri" | "diger")}
          className="rounded-md border px-2.5 py-2 text-sm"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        >
          <option value="kira_geliri">Kira Geliri</option>
          <option value="diger">Diğer</option>
        </select>
        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          className="rounded-md border px-2.5 py-2 text-sm"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        />
      </div>
      <input
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        placeholder="Açıklama"
        className="w-full rounded-md border px-2.5 py-2 text-sm mb-2"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          placeholder="Tutar (₺)"
          className="flex-1 rounded-md border px-2.5 py-2 text-sm"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        />
        <BirincilButon onClick={ekle} className={yukleniyor ? "opacity-60" : ""}>
          <Plus size={15} /> Ekle
        </BirincilButon>
      </div>
    </Panel>
  );
}

function GiderFormu({ siteId, kategoriler }: { siteId: string; kategoriler: Kategori[] }) {
  const [kategoriId, setKategoriId] = useState(kategoriler[0]?.id ?? "");
  const [yeniKategori, setYeniKategori] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState(new Date().toISOString().slice(0, 10));
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kategoriEkle() {
    if (!yeniKategori.trim()) return;
    await giderKategorisiEkle(siteId, yeniKategori.trim());
    setYeniKategori("");
    window.location.reload();
  }

  async function ekle() {
    const sayi = Number(tutar);
    if (!sayi || sayi <= 0 || !kategoriId) return;
    setYukleniyor(true);
    try {
      await giderEkle({
        site_id: siteId,
        kategori_id: kategoriId,
        tutar: sayi,
        gider_tarihi: tarih,
        aciklama,
      });
      setAciklama("");
      setTutar("");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <Panel className="p-4">
      <p className="text-sm font-medium mb-3">Gider Ekle</p>

      {kategoriler.length === 0 ? (
        <div className="flex gap-2 mb-2">
          <input
            value={yeniKategori}
            onChange={(e) => setYeniKategori(e.target.value)}
            placeholder="Örn: Temizlik, Asansör, Elektrik, Su"
            className="flex-1 rounded-md border px-2.5 py-2 text-sm"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          />
          <BirincilButon onClick={kategoriEkle}>Kategori Ekle</BirincilButon>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="rounded-md border px-2.5 py-2 text-sm"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          >
            {kategoriler.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className="rounded-md border px-2.5 py-2 text-sm"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          />
        </div>
      )}

      <input
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        placeholder="Açıklama"
        className="w-full rounded-md border px-2.5 py-2 text-sm mb-2"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          placeholder="Tutar (₺)"
          className="flex-1 rounded-md border px-2.5 py-2 text-sm"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        />
        <BirincilButon onClick={ekle} className={yukleniyor ? "opacity-60" : ""}>
          <Plus size={15} /> Ekle
        </BirincilButon>
      </div>

      {kategoriler.length > 0 && (
        <div className="flex gap-2 mt-2">
          <input
            value={yeniKategori}
            onChange={(e) => setYeniKategori(e.target.value)}
            placeholder="Yeni kategori ekle..."
            className="flex-1 rounded-md border px-2.5 py-1.5 text-xs"
            style={{ borderColor: "var(--kagit-cizgi)" }}
          />
          <button
            onClick={kategoriEkle}
            className="text-xs px-2.5 rounded-md border"
            style={{ borderColor: "var(--kagit-cizgi)", color: "var(--metin-ikincil)" }}
          >
            Ekle
          </button>
        </div>
      )}
    </Panel>
  );
}
