"use client";

import { useState } from "react";
import { FloorFormCikti } from "@/types/onboarding";

interface FloorFormProps {
  bloklar: { ad: string }[];
  onSubmit: (data: FloorFormCikti) => void;
  onBack: () => void;
}

interface KatAyari {
  bodrumSayisi: number;
  zeminVarMi: boolean;
  ustKatSayisi: number;
}

export default function FloorForm({ bloklar, onSubmit, onBack }: FloorFormProps) {
  const [ayarlar, setAyarlar] = useState<KatAyari[]>(
    bloklar.map(() => ({ bodrumSayisi: 0, zeminVarMi: true, ustKatSayisi: 1 }))
  );
  const [hatalar, setHatalar] = useState<Record<number, string>>({});

  function guncelle(i: number, alan: keyof KatAyari, deger: number | boolean) {
    const yeni = [...ayarlar];
    yeni[i] = { ...yeni[i], [alan]: deger };
    setAyarlar(yeni);
    const yeniHatalar = { ...hatalar };
    delete yeniHatalar[i];
    setHatalar(yeniHatalar);
  }

  function dogrula() {
    const yeni: Record<number, string> = {};
    ayarlar.forEach((a, i) => {
      const toplamKat = a.bodrumSayisi + (a.zeminVarMi ? 1 : 0) + a.ustKatSayisi;
      if (toplamKat < 1) yeni[i] = "En az bir kat olmalı";
    });
    setHatalar(yeni);
    return Object.keys(yeni).length === 0;
  }

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (dogrula()) onSubmit({ bloklar: ayarlar });
  }

  return (
    <form onSubmit={gonder} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Kat Yapısını Belirleyin</h2>
      <p className="text-gray-600 mb-6">Her blok için kat sayısını girin.</p>

      <div className="max-h-96 overflow-y-auto space-y-6 border rounded-lg p-4 bg-gray-50">
        {bloklar.map((blok, i) => (
          <div key={i} className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">{blok.ad || `Blok ${i + 1}`}</h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`zemin-${i}`}
                checked={ayarlar[i].zeminVarMi}
                onChange={(e) => guncelle(i, "zeminVarMi", e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor={`zemin-${i}`} className="text-sm text-gray-700">
                Zemin kat var
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bodrum kat sayısı
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={ayarlar[i].bodrumSayisi}
                onChange={(e) => guncelle(i, "bodrumSayisi", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Üst kat sayısı (zemin/bodrum hariç)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={ayarlar[i].ustKatSayisi}
                onChange={(e) => guncelle(i, "ustKatSayisi", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {hatalar[i] && <p className="text-red-500 text-sm">{hatalar[i]}</p>}
            {i < bloklar.length - 1 && <hr className="border-gray-300 mt-4" />}
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          ← Geri
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          İleri →
        </button>
      </div>
    </form>
  );
}