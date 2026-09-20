"use client";

import { useState } from "react";
import { BlockFormCikti } from "@/types/onboarding";

interface BlockFormProps {
  blokSayisi: number;
  onSubmit: (data: BlockFormCikti) => void;
  onBack: () => void;
}

export default function BlockForm({ blokSayisi, onSubmit, onBack }: BlockFormProps) {
  const [bloklar, setBloklar] = useState<{ ad: string }[]>(
    Array.from({ length: blokSayisi }, () => ({ ad: "" }))
  );
  const [hatalar, setHatalar] = useState<Record<number, string>>({});

  function dogrula() {
    const yeni: Record<number, string> = {};
    bloklar.forEach((blok, i) => {
      if (!blok.ad.trim()) yeni[i] = `${String.fromCharCode(65 + i)} Blok adı zorunlu`;
    });
    setHatalar(yeni);
    return Object.keys(yeni).length === 0;
  }

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (dogrula()) onSubmit({ bloklar });
  }

  function adDegistir(i: number, deger: string) {
    const yeni = [...bloklar];
    yeni[i] = { ad: deger };
    setBloklar(yeni);
    const yeniHatalar = { ...hatalar };
    delete yeniHatalar[i];
    setHatalar(yeniHatalar);
  }

  return (
    <form onSubmit={gonder} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Blok Adlarını Girin</h2>
      <p className="text-gray-600 mb-6">Toplam {blokSayisi} blok için ad belirleyin.</p>

      <div className="space-y-4">
        {bloklar.map((blok, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {String.fromCharCode(65 + i)} Blok Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={blok.ad}
              onChange={(e) => adDegistir(i, e.target.value)}
              placeholder={`Örn: ${String.fromCharCode(65 + i)} Blok`}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                hatalar[i] ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hatalar[i] && <p className="text-red-500 text-sm mt-1">{hatalar[i]}</p>}
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