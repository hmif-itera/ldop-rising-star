import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { NavbarMenu, type NavItem } from "@/components/navbar-menu";

type NavbarProps = {
  variant: "public" | "auth" | "admin";
};

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

const adminLinks: NavItem[] = [
  { href: "/admin", label: "Ringkasan", exact: true },
  { href: "/admin/booking", label: "Booking" },
  { href: "/admin/lapangan", label: "Lapangan" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/", label: "Exit Admin" },
];

export async function Navbar({ variant }: NavbarProps) {
  const session = variant === "auth" ? null : await auth();
  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || session.user.email || "Pengguna",
        image: session.user.image,
        isAdmin: session.user.role === "ADMIN",
      }
    : null;

  let links: NavItem[] = [];
  if (variant === "admin") {
    links = adminLinks;
  } else if (variant === "public") {
    links = [
      { href: "/", label: "Beranda", exact: true },
      { href: "/lapangan", label: "Lapangan" },
    ];
    if (user) links.push({ href: "/booking", label: "Booking Saya" });
    if (user?.isAdmin) links.push({ href: "/admin", label: "Admin" });
  }

  return <NavbarMenu variant={variant} links={links} user={user} logoutAction={logoutAction} />;
}
