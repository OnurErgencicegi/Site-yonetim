'use client';

import { useState } from 'react';

interface ApartmentFormProps {
  blocks: { name: string; floors: number; apartments: number[] }[];
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

export default function ApartmentForm({
  blocks,
  onSubmit,
  onBack,
  loading,
}: ApartmentFormProps) {
  const [apartmentData, setApartmentData] = useState(
    blocks.flatMap((block) =>
      Array.from({ length: block.floors }, (_, floorIdx) => ({
        blockName: block.name,
        floorNumber: floorIdx + 1,
        apartmentCount: 2,
      }))
    )
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    apartmentData.forEach((apt) => {
      if (apt.apartmentCount < 1) {
        newErrors[
          `${apt.blockName}-${apt.floorNumber}`
        ] = `En az 1 daire olmalı`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ apartmentData });
    }
  };

  const handleApartmentChange = (index: number, value: number) => {
    const newData = [...apartmentData];
    newData[index].apartmentCount = value;
    setApartmentData(newData);

    const apt = newData[index];
    const key = `${apt.blockName}-${apt.floorNumber}`;
    const newErrors = { ...errors };
    delete newErrors[key];
    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Her Katta Kaç Daire Var?
      </h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          ⚠️ Her kat ve her blok için daire sayısını belirleyin.
          <br />
          Zemin katında daha fazla daire olabilir (dükkanlar için).
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {blocks.map((block, blockIdx) => (
          <div key={blockIdx} className="mb-8">
            {/* Block Header */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {block.name}
            </h3>

            <div className="space-y-3">
              {apartmentData
                .filter((apt) => apt.blockName === block.name)
                .map((apt, idx) => {
                  const key = `${apt.blockName}-${apt.floorNumber}`;
                  const dataIndex = apartmentData.findIndex(
                    (a) =>
                      a.blockName === apt.blockName &&
                      a.floorNumber === apt.floorNumber
                  );

                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {apt.floorNumber}. Kat - Daire Sayısı{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={apt.apartmentCount}
                        onChange={(e) =>
                          handleApartmentChange(
                            dataIndex,
                            parseInt(e.target.value)
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors[key]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>

            {blockIdx < blocks.length - 1 && (
              <hr className="my-6 border-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-semibold mb-2">
          📊 Toplam Daire Sayısı:
        </p>
        <p className="text-green-700">
          {apartmentData.reduce((sum, apt) => sum + apt.apartmentCount, 0)}{' '}
          daire
        </p>
      </div>

      {/* Buttons */}
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
              <span className="animate-spin">⏳</span>
              Oluşturuluyor...
            </>
          ) : (
            '✓ Tamamla'
          )}
        </button>
      </div>
    </form>
  );
}