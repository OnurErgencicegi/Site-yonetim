"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { supabaseTarayici } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const MENU_OGELERI = [
  { href: "/yonetici", etiket: "Panel", ikon: LayoutDashboard },
  { href: "/yonetici/daireler", etiket: "Bloklar & Daireler", ikon: Building2 },
  { href: "/yonetici/onay-kuyrugu", etiket: "Onay Kuyruğu", ikon: UserCheck },
  { href: "/yonetici/aidat", etiket: "Aidat Yönetimi", ikon: Wallet },
  { href: "/yonetici/gelir-gider", etiket: "Gelir & Gider", ikon: ArrowLeftRight },
  { href: "/yonetici/kasa-raporu", etiket: "Kasa Raporu", ikon: BarChart3 },
  { href: "/yonetici/kurul", etiket: "Yönetim & Denetim Kurulu", ikon: Users },
];

export default function YanMenu({ siteAdi }: { siteAdi: string }) {
  const yol = usePathname();
  const router = useRouter();

  async function cikisYap() {
    const supabase = supabaseTarayici();
    await supabase.auth.signOut();
    router.push("/giris");
  }

  return (
    <aside
      className="flex h-screen w-64 flex-col shrink-0"
      style={{ background: "var(--murekkep)" }}
    >
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-xs tracking-wide text-white/50">Site Yönetimi</p>
        <h1 className="font-baslik text-lg text-white mt-1 leading-snug">
          {siteAdi}
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MENU_OGELERI.map((oge) => {
          const aktif =
            oge.href === "/yonetici"
              ? yol === "/yonetici"
              : yol.startsWith(oge.href);
          const Ikon = oge.ikon;
          return (
            <Link
              key={oge.href}
              href={oge.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors"
              style={{
                background: aktif ? "var(--camur-yesil)" : "transparent",
                color: aktif ? "white" : "rgba(255,255,255,0.75)",
              }}
            >
              <Ikon size={17} strokeWidth={2} />
              {oge.etiket}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={cikisYap}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
