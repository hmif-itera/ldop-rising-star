import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error !== "object" || error === null || !("meta" in error)) return "";
  const meta = error.meta;
  if (typeof meta !== "object" || meta === null || !("message" in meta)) return "";
  return typeof meta.message === "string" ? meta.message : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Data pendaftaran kurang tepat." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Data pendaftaran kurang tepat." }, { status: 400 });
  }
  const data = body as { nama?: unknown; email?: unknown; password?: unknown };
  const nama = typeof data.nama === "string" ? data.nama.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!nama || nama.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: "Format nama atau email tidak valid." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ message: "Kata sandi minimal 8 sampai 128 karakter." }, { status: 400 });
  }

  try {
    await prisma.user.create({
      data: { nama, email, passwordHash: await hashPassword(password) },
    });
    return NextResponse.json({ message: "Akun berhasil dibuat." }, { status: 201 });
  } catch (error) {
    const prismaCode = getErrorCode(error) ?? "";
    if (prismaCode === "P2002") {
      return NextResponse.json({ message: "Email ini sudah dipakai." }, { status: 409 });
    }

    const message = getErrorMessage(error);
    if (
      ["P1001", "P1002", "P1017", "P2010"].includes(prismaCode) ||
      /server selection timeout|no available servers|received fatal alert/i.test(message)
    ) {
      console.error("MongoDB Atlas tidak terkoneksi.");
      return NextResponse.json(
        { message: "Server tidak terhubung ke database. Coba lagi nanti." },
        { status: 503 },
      );
    }

    console.error("Gagal membuat akun:", error instanceof Error ? error.message : "Error tidak diketahui");
    return NextResponse.json({ message: "Gagal membuat akun. Coba lagi nanti." }, { status: 500 });
  }
}
