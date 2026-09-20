'use client';

import { useState } from 'react';

interface BlockFormProps {
  blockCount: number;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function BlockForm({
  blockCount,
  onSubmit,
  onBack,
}: BlockFormProps) {
  const [blocks, setBlocks] = useState<{ name: string }[]>(
    Array.from({ length: blockCount }, () => ({ name: '' }))
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const validate = () => {
    const newErrors: Record<number, string> = {};

    blocks.forEach((block, idx) => {
      if (!block.name.trim()) {
        newErrors[idx] = `${String.fromCharCode(65 + idx)} Blok adı zorunlu`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ blocks });
    }
  };

  const handleBlockNameChange = (index: number, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].name = value;
    setBlocks(newBlocks);

    // Clear error for this field when user starts typing
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Blok Adlarını Girin
      </h2>

      <p className="text-gray-600 mb-6">
        Toplam {blockCount} blok için adlar belirleyin.
      </p>

      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {String.fromCharCode(65 + idx)} Blok Adı{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={block.name}
              onChange={(e) =>
                handleBlockNameChange(idx, e.target.value)
              }
              placeholder={`Örn: ${String.fromCharCode(65 + idx)} Blok`}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors[idx] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors[idx] && (
              <p className="text-red-500 text-sm mt-1">{errors[idx]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
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