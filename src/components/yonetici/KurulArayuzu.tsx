"use client";

import { useState } from "react";
import { Panel, BirincilButon, IkincilButon } from "./Ortak";
import { kurulUyesiEkle, kurulUyesiSil } from "@/app/yonetici/eylemler";
import { Trash2, Phone, Mail } from "lucide-react";
import type { KurulGorevi } from "@/types/veritabani";

interface Uye {
  id: string;
  ad_soyad: string;
  telefon: string | null;
  eposta: string | null;
  fotograf_url: string | null;
  gorev: KurulGorevi;
}

export default function KurulArayuzu({
  siteId,
  uyeler,
  etiketler,
}: {
  siteId: string;
  uyeler: Uye[];
  etiketler: Record<KurulGorevi, string>;
}) {
  const [formAcik, setFormAcik] = useState(false);
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [eposta, setEposta] = useState("");
  const [gorev, setGorev] = useState<KurulGorevi>("yonetim_kurulu_uyesi");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function ekle() {
    if (!adSoyad.trim()) return;
    setYukleniyor(true);
    try {
      await kurulUyesiEkle({
        site_id: siteId,
        ad_soyad: adSoyad.trim(),
        telefon: telefon || undefined,
        eposta: eposta || undefined,
        gorev,
      });
      setAdSoyad("");
      setTelefon("");
      setEposta("");
      setFormAcik(false);
      window.location.reload();
    } finally {
      setYukleniyor(false);
    }
  }

  async function sil(id: string) {
    await kurulUyesiSil(id);
    window.location.reload();
  }

  const gruplu = (Object.keys(etiketler) as KurulGorevi[]).map((gorevKey) => ({
    gorevKey,
    etiket: etiketler[gorevKey],
    uyeler: uyeler.filter((u) => u.gorev === gorevKey),
  }));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <BirincilButon onClick={() => setFormAcik(!formAcik)}>
          {formAcik ? "Vazgeç" : "Üye Ekle"}
        </BirincilButon>
      </div>

      {formAcik && (
        <Panel className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              placeholder="Ad Soyad"
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            />
            <select
              value={gorev}
              onChange={(e) => setGorev(e.target.value as KurulGorevi)}
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            >
              {(Object.keys(etiketler) as KurulGorevi[]).map((g) => (
                <option key={g} value={g}>
                  {etiketler[g]}
                </option>
              ))}
            </select>
            <input
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="Telefon"
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            />
            <input
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              placeholder="E-posta"
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--kagit-cizgi)" }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <IkincilButon onClick={() => setFormAcik(false)}>Vazgeç</IkincilButon>
            <BirincilButon onClick={ekle} className={yukleniyor ? "opacity-60" : ""}>
              Kaydet
            </BirincilButon>
          </div>
        </Panel>
      )}

      {gruplu.map(
        (grup) =>
          grup.uyeler.length > 0 && (
            <div key={grup.gorevKey}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--metin-ikincil)" }}>
                {grup.etiket}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grup.uyeler.map((u) => (
                  <Panel key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {u.fotograf_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.fotograf_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{ background: "var(--kagit-cizgi)" }}
                        >
                          {u.ad_soyad[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{u.ad_soyad}</p>
                        <div
                          className="flex items-center gap-2 text-xs"
                          style={{ color: "var(--metin-ikincil)" }}
                        >
                          {u.telefon && (
                            <span className="flex items-center gap-1">
                              <Phone size={11} /> {u.telefon}
                            </span>
                          )}
                          {u.eposta && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} /> {u.eposta}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => sil(u.id)}>
                      <Trash2 size={15} style={{ color: "var(--metin-ikincil)" }} />
                    </button>
                  </Panel>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
