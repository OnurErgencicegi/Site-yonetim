"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { BirincilButon } from "./Ortak";
import { sakinEkle } from "@/app/yonetici/eylemler";
import { supabaseTarayici } from "@/lib/supabase/client";
import type { MeslekTipi } from "@/types/veritabani";

/** Telefonu 05xx formatına sabitler; kullanıcı "5xx..." yazsa bile başına 0 ekler. */
function telefonBicimlendir(deger: string): string {
  const rakamlar = deger.replace(/\D/g, "");
  if (rakamlar.length === 0) return "";
  if (rakamlar.startsWith("0")) return rakamlar.slice(0, 11);
  return ("0" + rakamlar).slice(0, 11);
}

export default function SakinEkleFormu({
  daireId,
  sakinTipi,
  baslik,
}: {
  daireId: string;
  sakinTipi: "malik" | "kiraci";
  baslik: string;
}) {
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("0");
  const [telefonDuzenlenebilir, setTelefonDuzenlenebilir] = useState(true);
  const [telefon2, setTelefon2] = useState("");
  const [eposta, setEposta] = useState("");
  const [meslek, setMeslek] = useState<MeslekTipi | "">("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoOnizleme, setFotoOnizleme] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const zorunluAlanlarDolu =
    adSoyad.trim().length > 2 &&
    telefon.length === 11 &&
    meslek !== "" &&
    foto !== null;

  function fotoSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    setFoto(dosya);
    setFotoOnizleme(URL.createObjectURL(dosya));
  }

  async function kaydet() {
    if (!zorunluAlanlarDolu || !foto) {
      setHata("Devam etmek için tüm zorunlu alanları ve fotoğrafı ekleyin.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    try {
      const supabase = supabaseTarayici();
      const dosyaYolu = `${daireId}/${sakinTipi}-${Date.now()}-${foto.name}`;
      const { error: yuklemeHatasi } = await supabase.storage
        .from("fotograflar")
        .upload(dosyaYolu, foto);
      if (yuklemeHatasi) throw new Error(yuklemeHatasi.message);

      const { data: url } = supabase.storage.from("fotograflar").getPublicUrl(dosyaYolu);

      await sakinEkle({
        daire_id: daireId,
        sakin_tipi: sakinTipi,
        ad_soyad: adSoyad.trim(),
        telefon,
        telefon2: telefon2 || undefined,
        eposta: eposta || undefined,
        meslek_tipi: meslek as MeslekTipi,
        fotograf_url: url.publicUrl,
      });
      window.location.reload();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kaydedilirken bir hata oluştu");
      setYukleniyor(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: "var(--metin-ikincil)" }}>
        Bu daire için {baslik.toLowerCase()} bilgisi henüz girilmedi.
      </p>

      <div className="flex items-center gap-3">
        <label
          className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed shrink-0 overflow-hidden"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        >
          {fotoOnizleme ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoOnizleme} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={18} style={{ color: "var(--metin-ikincil)" }} />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={fotoSecildi} />
        </label>
        <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
          Fotoğraf zorunludur
        </p>
      </div>

      <input
        value={adSoyad}
        onChange={(e) => setAdSoyad(e.target.value)}
        placeholder="Ad Soyad"
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      />

      <div className="flex gap-2">
        <input
          value={telefon}
          disabled={!telefonDuzenlenebilir}
          onChange={(e) => setTelefon(telefonBicimlendir(e.target.value))}
          placeholder="05xx xxx xx xx"
          className="flex-1 rounded-md border px-3 py-2 text-sm disabled:bg-black/[.03]"
          style={{ borderColor: "var(--kagit-cizgi)" }}
        />
        {!telefonDuzenlenebilir && (
          <button
            onClick={() => setTelefonDuzenlenebilir(true)}
            className="text-xs px-2 rounded-md border"
            style={{ borderColor: "var(--kagit-cizgi)", color: "var(--metin-ikincil)" }}
          >
            Düzelt
          </button>
        )}
      </div>

      <input
        value={telefon2}
        onChange={(e) => setTelefon2(telefonBicimlendir(e.target.value))}
        placeholder="2. Telefon (opsiyonel)"
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      />

      <input
        value={eposta}
        onChange={(e) => setEposta(e.target.value)}
        placeholder="E-posta (opsiyonel)"
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      />

      <select
        value={meslek}
        onChange={(e) => setMeslek(e.target.value as MeslekTipi)}
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: "var(--kagit-cizgi)" }}
      >
        <option value="">Meslek durumu seçin</option>
        <option value="kamu">Kamu</option>
        <option value="ozel">Özel Sektör</option>
        <option value="emekli">Emekli</option>
        <option value="issiz">İşsiz</option>
      </select>

      {hata && (
        <p className="text-sm" style={{ color: "var(--uyari-kirmizi)" }}>
          {hata}
        </p>
      )}

      <BirincilButon onClick={kaydet} className={!zorunluAlanlarDolu ? "opacity-40" : ""}>
        {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
      </BirincilButon>
      {!zorunluAlanlarDolu && (
        <p className="text-xs" style={{ color: "var(--metin-ikincil)" }}>
          Ad soyad, telefon, meslek ve fotoğraf zorunludur.
        </p>
      )}
    </div>
  );
}
