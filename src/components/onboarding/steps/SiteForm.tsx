"use client";

import { useState } from "react";
import { SiteFormCikti } from "@/types/onboarding";

interface SiteFormProps {
  onSubmit: (data: SiteFormCikti) => void;
}

const iller = ["Antalya", "İstanbul", "Ankara", "Erzurum", "Kahramanmaraş", "İzmir", "Bursa"];

export default function SiteForm({ onSubmit }: SiteFormProps) {
  const [form, setForm] = useState<SiteFormCikti>({
    siteAdi: "",
    il: "",
    ilce: "",
    adres: "",
    blokSayisi: 1,
  });
  const [hatalar, setHatalar] = useState<Record<string, string>>({});

  function dogrula() {
    const yeni: Record<string, string> = {};
    if (!form.siteAdi.trim()) yeni.siteAdi = "Site adı zorunlu";
    if (!form.il) yeni.il = "İl seçimi zorunlu";
    if (!form.ilce.trim()) yeni.ilce = "İlçe zorunlu";
    if (!form.adres.trim()) yeni.adres = "Adres zorunlu";
    if (form.blokSayisi < 1) yeni.blokSayisi = "En az 1 blok olmalı";
    setHatalar(yeni);
    return Object.keys(yeni).length === 0;
  }

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (dogrula()) onSubmit(form);
  }

  return (
    <form onSubmit={gonder} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Site Bilgilerini Girin</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.siteAdi}
          onChange={(e) => setForm({ ...form, siteAdi: e.target.value })}
          placeholder="Örn: Yeşil Vadi Sitesi"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hatalar.siteAdi ? "border-red-500" : "border-gray-300"
          }`}
        />
        {hatalar.siteAdi && <p className="text-red-500 text-sm mt-1">{hatalar.siteAdi}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İl <span className="text-red-500">*</span>
        </label>
        <select
          value={form.il}
          onChange={(e) => setForm({ ...form, il: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hatalar.il ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Seçiniz...</option>
          {iller.map((il) => (
            <option key={il} value={il}>
              {il}
            </option>
          ))}
        </select>
        {hatalar.il && <p className="text-red-500 text-sm mt-1">{hatalar.il}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İlçe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.ilce}
          onChange={(e) => setForm({ ...form, ilce: e.target.value })}
          placeholder="Örn: Muratpaşa"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hatalar.ilce ? "border-red-500" : "border-gray-300"
          }`}
        />
        {hatalar.ilce && <p className="text-red-500 text-sm mt-1">{hatalar.ilce}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adres <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.adres}
          onChange={(e) => setForm({ ...form, adres: e.target.value })}
          placeholder="Tam adres yazınız"
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hatalar.adres ? "border-red-500" : "border-gray-300"
          }`}
        />
        {hatalar.adres && <p className="text-red-500 text-sm mt-1">{hatalar.adres}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kaç Blok Var? <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={form.blokSayisi}
          onChange={(e) => setForm({ ...form, blokSayisi: parseInt(e.target.value) || 1 })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            hatalar.blokSayisi ? "border-red-500" : "border-gray-300"
          }`}
        />
        {hatalar.blokSayisi && <p className="text-red-500 text-sm mt-1">{hatalar.blokSayisi}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
      >
        İleri →
      </button>
    </form>
  );
}