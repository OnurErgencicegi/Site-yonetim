"use client";

import { useState } from "react";
import { BlokBilgisi, katEtiketi } from "@/types/onboarding";

interface ApartmentFormProps {
  bloklar: BlokBilgisi[];
  onSubmit: (bloklar: BlokBilgisi[]) => void;
  onBack: () => void;
  loading: boolean;
  hata?: string;
}

export default function ApartmentForm({ bloklar, onSubmit, onBack, loading, hata }: ApartmentFormProps) {
  const [veri, setVeri] = useState<BlokBilgisi[]>(bloklar);
  const [hatalar, setHatalar] = useState<string[]>([]);

  function katGuncelle(blokIdx: number, katIdx: number, alan: "daire_sayisi" | "isyeri_sayisi", deger: number) {
    const yeni = veri.map((b, bi) =>
      bi !== blokIdx
        ? b
        : {
            ...b,
            katlar: b.katlar.map((k, ki) => (ki !== katIdx ? k : { ...k, [alan]: Math.max(0, deger) })),
          }
    );
    setVeri(yeni);
  }

  function dogrula() {
    const yeniHatalar: string[] = [];
    veri.forEach((blok) => {
      blok.katlar.forEach((kat) => {
        if (kat.daire_sayisi === 0 && kat.isyeri_sayisi === 0) {
          yeniHatalar.push(`${blok.ad} - ${katEtiketi(kat)}: en az bir daire veya işyeri girin`);
        }
      });
    });
    setHatalar(yeniHatalar);
    return yeniHatalar.length === 0;
  }

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (dogrula()) onSubmit(veri);
  }

  const toplamDaire = veri.reduce(
    (s, b) => s + b.katlar.reduce((s2, k) => s2 + k.daire_sayisi + k.isyeri_sayisi, 0),
    0
  );

  return (
    <form onSubmit={gonder} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Her Katta Kaç Daire/İşyeri Var?</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          ⚠️ Zemin katta dükkan (işyeri) sayısı daha fazla olabilir, ayrıca girebilirsiniz.
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-8">
        {veri.map((blok, blokIdx) => (
          <div key={blokIdx}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{blok.ad}</h3>
            <div className="space-y-4">
              {blok.katlar.map((kat, katIdx) => (
                <div key={katIdx} className="grid grid-cols-2 gap-3 items-end border-b border-gray-200 pb-3">
                  <div className="col-span-2 text-sm font-medium text-gray-700">{katEtiketi(kat)}</div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Daire Sayısı</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={kat.daire_sayisi}
                      onChange={(e) =>
                        katGuncelle(blokIdx, katIdx, "daire_sayisi", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">İşyeri Sayısı</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={kat.isyeri_sayisi}
                      onChange={(e) =>
                        katGuncelle(blokIdx, katIdx, "isyeri_sayisi", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hatalar.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
          {hatalar.map((h, i) => (
            <p key={i} className="text-red-600 text-sm">
              {h}
            </p>
          ))}
        </div>
      )}

      {hata && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">❌ {hata}</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-semibold mb-1">📊 Toplam Birim Sayısı:</p>
        <p className="text-green-700">{toplamDaire} daire/işyeri</p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          ← Geri
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Oluşturuluyor...
            </>
          ) : (
            "✓ Tamamla"
          )}
        </button>
      </div>
    </form>
  );
}