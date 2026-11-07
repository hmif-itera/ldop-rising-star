"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  /** Aktif hanya kalau URL persis sama (untuk "/" dan "/admin"). */
  exact?: boolean;
};

type NavbarMenuProps = {
  variant: "public" | "auth" | "admin";
  links: NavItem[];
  user: { id: string; name: string; image?: string | null; isAdmin: boolean } | null;
  logoutAction: () => Promise<void>;
};

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function UserChip({ name, image }: { name: string; image?: string | null }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 rounded-lg transition-colors hover:text-white">
      <img
        src={image || "/favicon.ico"}
        alt=""
        className="size-8 shrink-0 rounded-full bg-shuttle object-cover ring-2 ring-shuttle ring-offset-2 ring-offset-night"
      />
      <span className="truncate text-sm font-semibold text-white">{name}</span>
    </span>
  );
}

export function NavbarMenu({ variant, links, user, logoutAction }: NavbarMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);
  const showMenu = variant !== "auth";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night text-slate-300">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo href={variant === "admin" ? "/admin" : "/"} tag={variant === "admin" ? "Admin" : undefined} />

        {showMenu ? (
          <>
            <nav aria-label={variant === "admin" ? "Navigasi admin" : "Navigasi utama"} className="hidden h-full flex-1 md:block">
              <ul className="flex h-full items-center gap-1">
                {links.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.href} className="h-full">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex h-full items-center px-3 text-sm font-medium transition-colors hover:text-white",
                          "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-shuttle after:transition-transform",
                          active ? "text-white after:scale-x-100" : "after:scale-x-0",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <Link href="/profile" aria-label={`Buka profil ${user.name}`} className="max-w-48 rounded-lg p-1.5 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-shuttle">
                    <UserChip name={user.name} image={user.image} />
                  </Link>
                  <form action={logoutAction}>
                    <Button type="submit" variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white">
                      <LogOutIcon /> Keluar
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white">
                    <Link href="/register">Daftar</Link>
                  </Button>
                  <Button asChild variant="accent" size="sm">
                    <Link href="/login">Masuk</Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 md:hidden"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </Button>
          </>
        ) : (
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white">
            <Link href="/"><ArrowLeftIcon /> <span className="hidden sm:inline">Kembali ke</span> Beranda</Link>
          </Button>
        )}
      </Container>

      {showMenu && open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 top-16 bg-night/40 backdrop-blur-[1px] md:hidden" onClick={close} />
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full border-b border-white/10 bg-night shadow-2xl animate-in fade-in slide-in-from-top-2 md:hidden"
          >
            <Container className="py-3">
              <nav aria-label="Menu">
                <ul className="space-y-1">
                  {links.map((item) => {
                    const active = isActive(pathname, item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                            active ? "bg-white/[0.07] text-white" : "hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <span className={cn("h-5 w-1 rounded-full", active ? "bg-shuttle" : "bg-transparent")} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-3 border-t border-white/10 pt-4 pb-2">
                {user ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link href="/profile" onClick={close} aria-label={`Buka profil ${user.name}`} className="min-w-0 rounded-lg p-1.5 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-shuttle">
                      <UserChip name={user.name} image={user.image} />
                    </Link>
                    <form action={logoutAction}>
                      <Button type="submit" variant="outline" size="sm" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                        <LogOutIcon /> Keluar
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                      <Link href="/register" onClick={close}>Daftar</Link>
                    </Button>
                    <Button asChild variant="accent">
                      <Link href="/login" onClick={close}>Masuk</Link>
                    </Button>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </>
      ) : null}
    </header>
  );
}
