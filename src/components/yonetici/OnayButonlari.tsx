"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { sakinOnayla, sakinReddet } from "@/app/yonetici/eylemler";

export default function OnayButonlari({ sakinId }: { sakinId: string }) {
  const [isleniyor, setIsleniyor] = useState(false);

  async function calistir(fn: (id: string) => Promise<void>) {
    setIsleniyor(true);
    try {
      await fn(sakinId);
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={isleniyor}
        onClick={() => calistir(sakinOnayla)}
        className="rounded-md p-2 text-white disabled:opacity-50"
        style={{ background: "var(--camur-yesil)" }}
        title="Onayla"
      >
        <Check size={15} />
      </button>
      <button
        disabled={isleniyor}
        onClick={() => calistir(sakinReddet)}
        className="rounded-md p-2 border disabled:opacity-50"
        style={{ borderColor: "var(--kagit-cizgi)", color: "var(--uyari-kirmizi)" }}
        title="Reddet"
      >
        <X size={15} />
      </button>
    </div>
  );
}
