import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type UserRole = "USER" | "ADMIN";

export async function requireUser(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (roles && !roles.includes(session.user.role as UserRole)) redirect("/");

  return session.user;
}

export async function requireApiUser(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      user: null,
      response: NextResponse.json({ message: "Kamu belum masuk. Masuk dulu untuk lanjut." }, { status: 401 }),
    };
  }

  if (roles && !roles.includes(session.user.role as UserRole)) {
    return {
      user: null,
      response: NextResponse.json({ message: "Kamu tidak punya akses ke bagian ini." }, { status: 403 }),
    };
  }

  return { user: session.user, response: null };
}
