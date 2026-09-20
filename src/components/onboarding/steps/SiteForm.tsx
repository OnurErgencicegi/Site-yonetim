'use client';

import { useState } from 'react';

interface SiteFormProps {
  onSubmit: (data: any) => void;
}

const cities = [
  'Antalya',
  'İstanbul',
  'Ankara',
  'Erzurum',
  'Kahramanmaraş',
  'İzmir',
  'Bursa',
];

export default function SiteForm({ onSubmit }: SiteFormProps) {
  const [formData, setFormData] = useState({
    siteName: '',
    il: '',
    ilce: '',
    adres: '',
    blockCount: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.siteName.trim())
      newErrors.siteName = 'Site adı zorunlu';
    if (!formData.il) newErrors.il = 'İl seçimi zorunlu';
    if (!formData.ilce.trim())
      newErrors.ilce = 'İlçe zorunlu';
    if (!formData.adres.trim())
      newErrors.adres = 'Adres zorunlu';
    if (formData.blockCount < 1)
      newErrors.blockCount = 'En az 1 blok olmalı';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Site Bilgilerini Girin
      </h2>

      {/* Site Adı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.siteName}
          onChange={(e) =>
            setFormData({ ...formData, siteName: e.target.value })
          }
          placeholder="Örn: Greenland Apartmanları"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.siteName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.siteName && (
          <p className="text-red-500 text-sm mt-1">{errors.siteName}</p>
        )}
      </div>

      {/* İl */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İl <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.il}
          onChange={(e) => setFormData({ ...formData, il: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.il ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Seçiniz...</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.il && (
          <p className="text-red-500 text-sm mt-1">{errors.il}</p>
        )}
      </div>

      {/* İlçe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İlçe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.ilce}
          onChange={(e) =>
            setFormData({ ...formData, ilce: e.target.value })
          }
          placeholder="Örn: Muratpaşa"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.ilce ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.ilce && (
          <p className="text-red-500 text-sm mt-1">{errors.ilce}</p>
        )}
      </div>

      {/* Adres */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adres <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.adres}
          onChange={(e) =>
            setFormData({ ...formData, adres: e.target.value })
          }
          placeholder="Tam adres yazınız"
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.adres ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.adres && (
          <p className="text-red-500 text-sm mt-1">{errors.adres}</p>
        )}
      </div>

      {/* Blok Sayısı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kaç Blok Var? <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.blockCount}
          onChange={(e) =>
            setFormData({
              ...formData,
              blockCount: parseInt(e.target.value),
            })
          }
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.blockCount ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.blockCount && (
          <p className="text-red-500 text-sm mt-1">{errors.blockCount}</p>
        )}
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
      >
        İleri →
      </button>
    </form>
  );
}