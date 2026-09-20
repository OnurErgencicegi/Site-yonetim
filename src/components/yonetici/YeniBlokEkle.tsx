"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { BirincilButon, IkincilButon } from "./Ortak";
import { blokEkle, katVeDairelerEkle } from "@/app/yonetici/eylemler";

export default function YeniBlokEkle({ siteId }: { siteId: string }) {
  const [acik, setAcik] = useState(false);
  const [adim, setAdim] = useState<"blok" | "katlar">("blok");
  const [blokAdi, setBlokAdi] = useState("");
  const [blokId, setBlokId] = useState<string | null>(null);
  const [katSayisi, setKatSayisi] = useState(1);
  const [katBasinaDaire, setKatBasinaDaire] = useState(2);
  const [daireTipi, setDaireTipi] = useState<"daire" | "isyeri">("daire");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  function kapatVeSifirla() {
    setAcik(false);
    setAdim("blok");
    setBlokAdi("");
    setBlokId(null);
    setHata("");
  }

  async function blokOlustur() {
    if (!blokAdi.trim()) return;
    setYukleniyor(true);
    setHata("");
    try {
      const yeniId = await blokEkle(siteId, blokAdi.trim());
      setBlokId(yeniId);
      setAdim("katlar");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  }

  async function katlariOlustur() {
    if (!blokId) return;
    setYukleniyor(true);
    setHata("");
    try {
      for (let katNo = 1; katNo <= katSayisi; katNo++) {
        const daireler = Array.from({ length: katBasinaDaire }, (_, i) => ({
          daire_no: `${katNo}${String.fromCharCode(65 + i)}`, // 1A, 1B...
          daire_tipi: daireTipi,
        }));
        await katVeDairelerEkle(blokId, katNo, daireler);
      }
      window.location.reload();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir hata oluştu");
      setYukleniyor(false);
    }
  }

  return (
    <>
      <BirincilButon onClick={() => setAcik(true)}>
        <Plus size={16} />
        Yeni Blok Ekle
      </BirincilButon>

      {acik && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-baslik text-lg">Yeni Blok Ekle</h3>
              <button onClick={kapatVeSifirla}>
                <X size={18} style={{ color: "var(--metin-ikincil)" }} />
              </button>
            </div>

            {adim === "blok" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Blok Adı</label>
                  <input
                    value={blokAdi}
                    onChange={(e) => setBlokAdi(e.target.value)}
                    placeholder="Örn: A Blok"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--kagit-cizgi)" }}
                  />
                </div>
                {hata && (
                  <p className="text-sm" style={{ color: "var(--uyari-kirmizi)" }}>
                    {hata}
                  </p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <IkincilButon onClick={kapatVeSifirla}>Vazgeç</IkincilButon>
                  <BirincilButon onClick={blokOlustur}>
                    {yukleniyor ? "Kaydediliyor..." : "Devam Et"}
                  </BirincilButon>
                </div>
                <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
                  Bir sonraki adımda bu bloğa kat ve daire ekleyeceksiniz.
                </p>
              </div>
            )}

            {adim === "katlar" && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "var(--metin-ikincil)" }}>
                  <strong>{blokAdi}</strong> için kaç kat olacak ve her katta kaç bağımsız
                  bölüm olacak?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Kat Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      value={katSayisi}
                      onChange={(e) => setKatSayisi(Number(e.target.value))}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--kagit-cizgi)" }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Kat Başına Adet</label>
                    <select
                      value={katBasinaDaire}
                      onChange={(e) => setKatBasinaDaire(Number(e.target.value))}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--kagit-cizgi)" }}
                    >
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Tip</label>
                  <select
                    value={daireTipi}
                    onChange={(e) => setDaireTipi(e.target.value as "daire" | "isyeri")}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--kagit-cizgi)" }}
                  >
                    <option value="daire">Daire (konut)</option>
                    <option value="isyeri">İşyeri</option>
                  </select>
                </div>
                {hata && (
                  <p className="text-sm" style={{ color: "var(--uyari-kirmizi)" }}>
                    {hata}
                  </p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <IkincilButon onClick={kapatVeSifirla}>Vazgeç</IkincilButon>
                  <BirincilButon onClick={katlariOlustur}>
                    {yukleniyor ? "Oluşturuluyor..." : "Kat ve Daireleri Oluştur"}
                  </BirincilButon>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
