import Link from "next/link";
import { Container } from "@/components/container";
import { CourtLines } from "@/components/court-lines";
import { Logo } from "@/components/logo";

const footerLinks = [
  {
    title: "Jelajahi",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/lapangan", label: "Daftar Lapangan" },
      { href: "/booking", label: "Booking Saya" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-night text-slate-300">
      <CourtLines />
      <Container className="relative grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="col-span-2 max-w-sm space-y-4 lg:col-span-1">
          <Logo />
          <p className="text-sm leading-relaxed text-slate-400">
            Booking lapangan futsal dan badminton tanpa ribet. Pilih tanggal, pilih jam main, langsung tanding.
          </p>
        </div>

        {footerLinks.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-xs font-semibold tracking-wider text-white uppercase">{group.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-shuttle">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col gap-1 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Matchday. Semua hak dilindungi.</p>
          <p>Rising Star LDOP · Kelompok 8</p>
        </Container>
      </div>
    </footer>
  );
}
