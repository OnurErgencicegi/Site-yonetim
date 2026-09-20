"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseTarayici } from "@/lib/supabase/client";

export default function GirisSayfasi() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setHata("");
    const supabase = supabaseTarayici();
    const { error } = await supabase.auth.signInWithPassword({ email: eposta, password: sifre });
    if (error) {
      setHata("E-posta veya şifre hatalı.");
      setYukleniyor(false);
      return;
    }
    router.push("/yonetici");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--murekkep)" }}
    >
      <div className="w-full max-w-sm">
        <p className="text-center text-xs tracking-wide text-white/50 mb-1">Site Yönetimi</p>
        <h1 className="font-baslik text-2xl text-white text-center mb-8">Giriş Yap</h1>

        <form
          onSubmit={girisYap}
          className="rounded-lg p-6 space-y-4"
          style={{ background: "var(--kagit-panel)" }}
        >
          <div>
            <label className="text-sm font-medium block mb-1.5">E-posta</label>
            <input
              type="email"
              required
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Şifre</label>
            <input
              type="password"
              required
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            />
          </div>
          {hata && (
            <p className="text-sm" style={{ color: "var(--uyari-kirmizi)" }}>
              {hata}
            </p>
          )}
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--camur-yesil)" }}
          >
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
