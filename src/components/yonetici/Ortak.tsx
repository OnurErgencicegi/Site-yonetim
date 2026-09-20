export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border ${className}`}
      style={{ background: "var(--kagit-panel)", borderColor: "var(--kagit-cizgi)" }}
    >
      {children}
    </div>
  );
}

export function SayfaBasligi({
  baslik,
  aciklama,
  aksiyon,
}: {
  baslik: string;
  aciklama?: string;
  aksiyon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-baslik text-2xl" style={{ color: "var(--metin-ana)" }}>
          {baslik}
        </h1>
        {aciklama && (
          <p className="text-sm mt-1" style={{ color: "var(--metin-ikincil)" }}>
            {aciklama}
          </p>
        )}
      </div>
      {aksiyon}
    </div>
  );
}

export function Rozet({
  metin,
  tip,
}: {
  metin: string;
  tip: "basari" | "uyari" | "bekleme" | "notr";
}) {
  const stiller = {
    basari: { background: "var(--basari-yesil-zemin)", color: "var(--basari-yesil)" },
    uyari: { background: "var(--uyari-kirmizi-zemin)", color: "var(--uyari-kirmizi)" },
    bekleme: { background: "var(--bekleme-amber-zemin)", color: "var(--bekleme-amber)" },
    notr: { background: "#EDECE7", color: "var(--metin-ikincil)" },
  }[tip];

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={stiller}
    >
      {metin}
    </span>
  );
}

export function BirincilButon({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${className}`}
      style={{ background: "var(--camur-yesil)" }}
    >
      {children}
    </button>
  );
}

export function IkincilButon({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.03] ${className}`}
      style={{ borderColor: "var(--kagit-cizgi)", color: "var(--metin-ana)" }}
    >
      {children}
    </button>
  );
}

export function paraFormatla(tutar: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(tutar);
}
